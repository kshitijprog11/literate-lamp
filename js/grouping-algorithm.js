// Grouping Algorithm for Mindful Dining
// This algorithm groups users with similar personality scores for optimal dining experiences

/**
 * Main grouping function that takes an array of user objects and returns groups
 * @param {Array} users - Array of user objects with personality scores
 * @param {Object} options - Configuration options for grouping
 * @returns {Array} Array of groups, each containing user objects
 */
function createDiningGroups(users, options = {}) {
    const { eventDate = null, ...configOverrides } = options;
    
    // Default configuration
    const config = {
        minGroupSize: 2,
        maxGroupSize: 12,
        idealGroupSize: 6,
        scoreThreshold: 10, // Maximum score difference within a group
        diversityFactor: 0.2, // 0 = strict matching, 1 = random
        ...configOverrides
    };
    
    // Validate input
    if (!users || users.length === 0) {
        return [];
    }
    
    // Filter for valid users with required properties
    const validUsers = users.filter(user => 
        user.personalityResults && 
        typeof user.personalityResults.score === 'number' &&
        user.firstName && 
        user.lastName &&
        user.email
    );
    
    if (validUsers.length === 0) {
        console.warn('No valid users with personality scores found for grouping.');
        return [];
    }
    
    // Sort users by personality score to facilitate clustering
    const sortedUsers = [...validUsers].sort((a, b) => 
        a.personalityResults.score - b.personalityResults.score
    );
    
    // Create initial clusters based on score proximity
    const groups = createClusters(sortedUsers, config);
    
    // Optimize groups (balance sizes, handle small groups)
    const optimizedGroups = optimizeGroups(groups, config);
    
    // Add metadata to final groups
    const finalGroups = optimizedGroups.map((group, index) => ({
        id: `group_${Date.now()}_${index}`,
        members: group,
        size: group.length,
        averageScore: calculateAverageScore(group),
        scoreRange: calculateScoreRange(group),
        createdAt: new Date().toISOString(),
        tableAssignment: `Table ${index + 1}`,
        eventDate
    }));
    
    return finalGroups;
}

/**
 * Creates initial clusters based on personality scores.
 * Iterates through sorted users and groups them by score threshold.
 */
function createClusters(sortedUsers, config) {
    const groups = [];
    let currentGroup = [];
    let currentGroupScore = null;
    
    for (const user of sortedUsers) {
        const userScore = user.personalityResults.score;
        
        // Start a new group if current is empty
        if (currentGroup.length === 0) {
            currentGroup = [user];
            currentGroupScore = userScore;
        }
        // Check if user fits in current group (score threshold and max size)
        else if (
            Math.abs(userScore - currentGroupScore) > config.scoreThreshold ||
            currentGroup.length >= config.maxGroupSize
        ) {
            // Push current group if it meets minimum size
            if (currentGroup.length >= config.minGroupSize) {
                groups.push([...currentGroup]);
            } else {
                // If too small, try to merge with previous group if there's space
                if (groups.length > 0 && groups[groups.length - 1].length < config.maxGroupSize) {
                    groups[groups.length - 1].push(...currentGroup);
                } else {
                    // Otherwise push as is (will be handled by optimizeGroups)
                    groups.push([...currentGroup]);
                }
            }
            
            // Start the new group with current user
            currentGroup = [user];
            currentGroupScore = userScore;
        }
        else {
            // Add user to current group
            currentGroup.push(user);
        }
    }
    
    // Handle the remaining users in currentGroup
    if (currentGroup.length > 0) {
        if (currentGroup.length >= config.minGroupSize) {
            groups.push(currentGroup);
        } else if (groups.length > 0) {
            // Try to merge with the last group
            const lastGroup = groups[groups.length - 1];
            // Allow merging even if it slightly exceeds maxGroupSize to avoid stragglers
            // (Soft limit check or strict check depending on requirements. Here we allow slight overflow if needed or just push it)
             if (lastGroup.length + currentGroup.length <= config.maxGroupSize + 1) { // Allow +1 for edge case
                lastGroup.push(...currentGroup);
            } else {
                groups.push(currentGroup);
            }
        } else {
            // If it's the only group, push it even if small
            groups.push(currentGroup);
        }
    }
    
    return groups;
}

/**
 * Optimizes groups by balancing sizes and improving score distribution.
 */
function optimizeGroups(groups, config) {
    let optimizedGroups = [...groups];
    
    // Handle groups that are too small
    optimizedGroups = handleSmallGroups(optimizedGroups, config);
    
    // Balance group sizes
    optimizedGroups = balanceGroupSizes(optimizedGroups, config);
    
    // Add diversity if requested
    if (config.diversityFactor > 0) {
        optimizedGroups = addDiversity(optimizedGroups, config);
    }
    
    return optimizedGroups;
}

/**
 * Handles groups that are smaller than the minimum size.
 * Merges small groups or distributes members to other groups.
 */
function handleSmallGroups(groups, config) {
    const result = [];
    const smallGroupsUsers = [];
    
    // Separate valid groups and members from small groups
    for (const group of groups) {
        if (group.length >= config.minGroupSize) {
            result.push(group);
        } else {
            smallGroupsUsers.push(...group);
        }
    }
    
    // Distribute members from small groups
    while (smallGroupsUsers.length > 0) {
        // If we have enough stragglers to form a valid group
        if (smallGroupsUsers.length >= config.minGroupSize) {
            const newGroupSize = Math.min(smallGroupsUsers.length, config.idealGroupSize);
            // Optimization: Process from the end to avoid costly array shifting
            result.push(smallGroupsUsers.splice(smallGroupsUsers.length - newGroupSize, newGroupSize));
        } else {
            // Not enough to form a group, distribute them one by one
            // Optimization: Process from the end using pop() instead of shift() to avoid O(N) shift operation
            const userToPlace = smallGroupsUsers.pop();
            const bestGroup = findBestGroup(userToPlace, result, config);
            
            if (bestGroup) {
                // Add to best group. Allow slightly exceeding maxGroupSize to accommodate stragglers.
                // This prevents infinite loops or leaving users behind.
                bestGroup.push(userToPlace);
            } else {
                // If no existing group is suitable (e.g., all are way too far in score),
                // we might have to create a small group or force fit.
                // Strategy: Force fit into the last group if no better option exists, 
                // or create a new undersized group if absolutely necessary (though we try to avoid this).
                if (result.length > 0) {
                     result[result.length - 1].push(userToPlace);
                } else {
                    // No groups exist at all, so this is the only user?
                    result.push([userToPlace]);
                }
            }
        }
    }
    
    return result;
}

/**
 * Finds the best group for a user based on personality score similarity.
 */
function findBestGroup(user, groups, config) {
    let bestGroup = null;
    let bestScoreDiff = Infinity;
    
    for (const group of groups) {
        // Calculate average score of the group
        const groupAverage = calculateAverageScore(group);
        const scoreDifference = Math.abs(user.personalityResults.score - groupAverage);
        
        // We prefer groups that haven't exploded in size, but we might pick a full group if it's the only option
        // Weight the score difference by how full the group is? 
        // For simplicity, just look for the closest score match.
        
        if (scoreDifference < bestScoreDiff) {
            bestScoreDiff = scoreDifference;
            bestGroup = group;
        }
    }
    
    return bestGroup;
}

/**
 * Balances group sizes to be closer to the ideal size.
 */
function balanceGroupSizes(groups, config) {
    const balanced = [...groups];
    
    // Find groups that are too large and too small
    const largeGroups = balanced.filter(g => g.length > config.idealGroupSize);
    const smallGroups = balanced.filter(g => g.length < config.idealGroupSize && g.length >= config.minGroupSize);
    
    for (const largeGroup of largeGroups) {
        while (largeGroup.length > config.idealGroupSize) {
            const memberToMove = largeGroup.pop(); // Remove last member (usually extreme score)
            
            const targetGroup = findBestGroup(memberToMove, smallGroups, config);
            
            if (targetGroup && targetGroup.length < config.idealGroupSize) {
                targetGroup.push(memberToMove);
            } else {
                // If no suitable group, put member back and stop trying for this group
                largeGroup.push(memberToMove);
                break;
            }
        }
    }
    
    return balanced;
}

/**
 * Adds some diversity to groups if requested by swapping members.
 */
function addDiversity(groups, config) {
    if (config.diversityFactor <= 0) return groups;
    
    const swapAttempts = Math.floor(groups.length * config.diversityFactor * 2);
    
    for (let i = 0; i < swapAttempts; i++) {
        // Pick two random groups
        const g1Idx = Math.floor(Math.random() * groups.length);
        const g2Idx = Math.floor(Math.random() * groups.length);
        
        if (g1Idx === g2Idx) continue;
        
        const group1 = groups[g1Idx];
        const group2 = groups[g2Idx];
        
        if (group1.length <= config.minGroupSize || group2.length <= config.minGroupSize) continue;
        
        // Pick random members
        const m1Idx = Math.floor(Math.random() * group1.length);
        const m2Idx = Math.floor(Math.random() * group2.length);
        
        const member1 = group1[m1Idx];
        const member2 = group2[m2Idx];
        
        // Check if swap is acceptable (scores still within range)
        const g1Sum = group1.reduce((acc, user) => acc + (user.personalityResults?.score || 0), 0);
        const g2Sum = group2.reduce((acc, user) => acc + (user.personalityResults?.score || 0), 0);

        const g1Count = group1.length - 1;
        const g2Count = group2.length - 1;

        const g1Avg = g1Count === 0 ? 0 : Math.round((g1Sum - (member1.personalityResults?.score || 0)) / g1Count);
        const g2Avg = g2Count === 0 ? 0 : Math.round((g2Sum - (member2.personalityResults?.score || 0)) / g2Count);
        
        const diff1 = Math.abs(member2.personalityResults.score - g1Avg);
        const diff2 = Math.abs(member1.personalityResults.score - g2Avg);
        
        // Allow swap if it doesn't break the threshold too badly (allow slightly looser threshold for diversity)
        if (diff1 <= config.scoreThreshold * 1.5 && diff2 <= config.scoreThreshold * 1.5) {
            group1[m1Idx] = member2;
            group2[m2Idx] = member1;
        }
    }
    
    return groups;
}

// Utility functions

function calculateAverageScore(group) {
    if (!group || group.length === 0) return 0;
    const sum = group.reduce((acc, user) => acc + (user.personalityResults?.score || 0), 0);
    return Math.round(sum / group.length);
}

function calculateScoreRange(group) {
    if (!group || group.length === 0) return { min: 0, max: 0 };
    const scores = group.map(user => user.personalityResults?.score || 0);
    return {
        min: Math.min(...scores),
        max: Math.max(...scores)
    };
}

/**
 * Generate email content for table assignments
 */
function generateTableAssignmentEmail(group, eventDetails) {
    const memberNames = group.members.map(m => `${m.firstName} ${m.lastName}`).join(', ');
    
    return {
        subject: `Your Table Assignment for Mindful Dining - ${eventDetails.date}`,
        html: `
            <h2>Your Table Assignment</h2>
            <p>We're excited to confirm your table assignment for our Mindful Dining experience!</p>
            
            <h3>Event Details:</h3>
            <ul>
                <li><strong>Date:</strong> ${eventDetails.date}</li>
                <li><strong>Time:</strong> ${eventDetails.time}</li>
                <li><strong>Table:</strong> ${group.tableAssignment}</li>
            </ul>
            
            <h3>Your Dining Companions:</h3>
            <p>Based on your personality assessment, you'll be dining with:</p>
            <p><em>${memberNames}</em></p>
            
            <p>We've carefully matched you based on compatible communication styles to ensure a wonderful evening.</p>
        `
    };
}

// Export functions based on environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createDiningGroups,
        generateTableAssignmentEmail,
        calculateAverageScore,
        calculateScoreRange
    };
} else {
    window.GroupingAlgorithm = {
        createDiningGroups,
        generateTableAssignmentEmail,
        calculateAverageScore,
        calculateScoreRange
    };
}
