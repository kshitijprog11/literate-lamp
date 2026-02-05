// Grouping Algorithm for Mindful Dining
// This algorithm groups users with similar personality scores for optimal dining experiences

/**
 * Main grouping function that takes an array of user objects and returns groups
 * @param {Array} users - Array of user objects with personality scores
 * @param {Object} options - Configuration options for grouping
 * @returns {Array} Array of groups, each containing user objects
 */
function createDiningGroups(users, options = {}) {
    // Default configuration
    const config = {
        minGroupSize: 2,
        maxGroupSize: 12,
        idealGroupSize: 6,
        scoreThreshold: 10, // Maximum score difference within a group (STRICTER MATCHING)
        diversityFactor: 0.2, // How much diversity to allow (0 = strict matching, 1 = random)
        ...options
    };
    
    // Validate input
    if (!users || users.length === 0) {
        return [];
    }
    
    // Ensure all users have required properties
    const validUsers = users.filter(user => 
        user.personalityResults && 
        typeof user.personalityResults.score === 'number' &&
        user.firstName && 
        user.lastName &&
        user.email
    );
    
    if (validUsers.length === 0) {
        console.warn('No valid users with personality scores found');
        return [];
    }
    
    console.log(`Grouping ${validUsers.length} users into dining groups`);
    
    // Sort users by personality score for easier grouping
    const sortedUsers = [...validUsers].sort((a, b) => 
        a.personalityResults.score - b.personalityResults.score
    );
    
    // Create groups using the clustering algorithm
    const groups = createClusters(sortedUsers, config);
    
    // Optimize groups for better balance
    const optimizedGroups = optimizeGroups(groups, config);
    
    // Add group metadata
    const finalGroups = optimizedGroups.map((group, index) => ({
        id: `group_${Date.now()}_${index}`,
        members: group,
        size: group.length,
        averageScore: calculateAverageScore(group),
        scoreRange: calculateScoreRange(group),
        createdAt: new Date().toISOString(),
        tableAssignment: `Table ${index + 1}`
    }));
    
    // Log grouping results
    logGroupingResults(finalGroups);
    
    return finalGroups;
}

/**
 * Creates initial clusters based on personality scores
 */
function createClusters(sortedUsers, config) {
    const groups = [];
    let currentGroup = [];
    let currentGroupScore = null;
    
    for (const user of sortedUsers) {
        const userScore = user.personalityResults.score;
        
        // If this is the first user or the group is full, start a new group
        if (currentGroup.length === 0) {
            currentGroup = [user];
            currentGroupScore = userScore;
        }
        // If adding this user would exceed the score threshold or max group size
        else if (
            Math.abs(userScore - currentGroupScore) > config.scoreThreshold ||
            currentGroup.length >= config.maxGroupSize
        ) {
            // Finalize current group if it meets minimum size
            if (currentGroup.length >= config.minGroupSize) {
                groups.push([...currentGroup]);
            } else {
                // If group is too small, try to merge with previous group
                if (groups.length > 0 && groups[groups.length - 1].length < config.maxGroupSize) {
                    groups[groups.length - 1].push(...currentGroup);
                } else {
                    // Create group anyway (will be optimized later)
                    groups.push([...currentGroup]);
                }
            }
            
            // Start new group
            currentGroup = [user];
            currentGroupScore = userScore;
        }
        // Add user to current group
        else {
            currentGroup.push(user);
        }
    }
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
        if (currentGroup.length >= config.minGroupSize) {
            groups.push(currentGroup);
        } else if (groups.length > 0) {
            // Merge with last group if possible
            const lastGroup = groups[groups.length - 1];
            if (lastGroup.length + currentGroup.length <= config.maxGroupSize) {
                lastGroup.push(...currentGroup);
            } else {
                groups.push(currentGroup);
            }
        } else {
            groups.push(currentGroup);
        }
    }
    
    return groups;
}

/**
 * Optimizes groups by balancing sizes and improving score distribution
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
 * Handles groups that are smaller than the minimum size
 */
function handleSmallGroups(groups, config) {
    const result = [];
    const smallGroups = [];
    
    for (const group of groups) {
        if (group.length >= config.minGroupSize) {
            result.push(group);
        } else {
            smallGroups.push(...group);
        }
    }
    
    // Try to merge small groups or add to existing groups
    while (smallGroups.length > 0) {
        if (smallGroups.length >= config.minGroupSize) {
            // Create a new group from remaining small group members
            const newGroupSize = Math.min(smallGroups.length, config.idealGroupSize);
            result.push(smallGroups.splice(0, newGroupSize));
        } else {
            // Add to the best fitting existing group
            const userToPlace = smallGroups.shift();
            const bestGroup = findBestGroup(userToPlace, result, config);
            
            if (bestGroup && bestGroup.length < config.maxGroupSize) {
                bestGroup.push(userToPlace);
            } else {
                // If no good group found, create a new one (even if small)
                result.push([userToPlace]);
            }
        }
    }
    
    return result;
}

/**
 * Finds the best group for a user based on personality score similarity
 */
function findBestGroup(user, groups, config) {
    let bestGroup = null;
    let bestScore = Infinity;
    
    for (const group of groups) {
        if (group.length >= config.maxGroupSize) continue;
        
        const groupAverage = calculateAverageScore(group);
        const scoreDifference = Math.abs(user.personalityResults.score - groupAverage);
        
        if (scoreDifference < bestScore && scoreDifference <= config.scoreThreshold) {
            bestScore = scoreDifference;
            bestGroup = group;
        }
    }
    
    return bestGroup;
}

/**
 * Balances group sizes to be closer to the ideal size
 */
function balanceGroupSizes(groups, config) {
    const balanced = [...groups];
    
    // Find groups that are too large and too small
    const largeGroups = balanced.filter(g => g.length > config.idealGroupSize);
    const smallGroups = balanced.filter(g => g.length < config.idealGroupSize && g.length >= config.minGroupSize);
    
    // Move members from large groups to small groups if score compatibility allows
    for (const largeGroup of largeGroups) {
        while (largeGroup.length > config.idealGroupSize) {
            const memberToMove = largeGroup.pop(); // Remove last member (usually closest in score)
            
            // Find a suitable small group
            const targetGroup = findBestGroup(memberToMove, smallGroups, config);
            
            if (targetGroup && targetGroup.length < config.idealGroupSize) {
                targetGroup.push(memberToMove);
            } else {
                // If no suitable group, put member back
                largeGroup.push(memberToMove);
                break;
            }
        }
    }
    
    return balanced;
}

/**
 * Adds some diversity to groups if requested
 */
function addDiversity(groups, config) {
    if (config.diversityFactor === 0) return groups;
    
    // Randomly swap some members between compatible groups
    const swapAttempts = Math.floor(groups.length * config.diversityFactor * 2);
    
    for (let i = 0; i < swapAttempts; i++) {
        const group1Index = Math.floor(Math.random() * groups.length);
        const group2Index = Math.floor(Math.random() * groups.length);
        
        if (group1Index === group2Index) continue;
        
        const group1 = groups[group1Index];
        const group2 = groups[group2Index];
        
        if (group1.length <= config.minGroupSize || group2.length <= config.minGroupSize) continue;
        
        const member1Index = Math.floor(Math.random() * group1.length);
        const member2Index = Math.floor(Math.random() * group2.length);
        
        const member1 = group1[member1Index];
        const member2 = group2[member2Index];
        
        // Check if swap would maintain score compatibility
        // Optimization: Calculate average mathematically to avoid O(N) array allocation/iteration from filter()
        const group1Sum = group1.reduce((acc, user) => acc + user.personalityResults.score, 0);
        const group2Sum = group2.reduce((acc, user) => acc + user.personalityResults.score, 0);

        const group1AvgWithoutMember1 = group1.length > 1
            ? Math.round((group1Sum - member1.personalityResults.score) / (group1.length - 1))
            : 0;
        const group2AvgWithoutMember2 = group2.length > 1
            ? Math.round((group2Sum - member2.personalityResults.score) / (group2.length - 1))
            : 0;
        
        const score1Diff = Math.abs(member2.personalityResults.score - group1AvgWithoutMember1);
        const score2Diff = Math.abs(member1.personalityResults.score - group2AvgWithoutMember2);
        
        if (score1Diff <= config.scoreThreshold && score2Diff <= config.scoreThreshold) {
            // Perform the swap
            group1[member1Index] = member2;
            group2[member2Index] = member1;
        }
    }
    
    return groups;
}

/**
 * Utility functions
 */
function calculateAverageScore(group) {
    if (group.length === 0) return 0;
    const sum = group.reduce((acc, user) => acc + user.personalityResults.score, 0);
    return Math.round(sum / group.length);
}

function calculateScoreRange(group) {
    if (group.length === 0) return { min: 0, max: 0 };
    const scores = group.map(user => user.personalityResults.score);
    return {
        min: Math.min(...scores),
        max: Math.max(...scores)
    };
}

function logGroupingResults(groups) {
    console.log('\n=== GROUPING RESULTS ===');
    console.log(`Total groups created: ${groups.length}`);
    
    groups.forEach((group, index) => {
        console.log(`\nGroup ${index + 1} (${group.tableAssignment}):`);
        console.log(`  Size: ${group.size}`);
        console.log(`  Average Score: ${group.averageScore}`);
        console.log(`  Score Range: ${group.scoreRange.min}-${group.scoreRange.max}`);
        console.log(`  Members:`);
        
        group.members.forEach((member, memberIndex) => {
            const personalityType = member.personalityResults.personality?.type || 'Unknown';
            console.log(`    ${memberIndex + 1}. ${member.firstName} ${member.lastName} (Score: ${member.personalityResults.score}, Type: ${personalityType})`);
        });
    });
    
    console.log('\n=== END GROUPING RESULTS ===\n');
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
            
            <p>We've carefully matched you based on compatible communication styles and dining preferences to ensure a wonderful evening of conversation and connection.</p>
            
            <h3>What to Expect:</h3>
            <ul>
                <li>Arrive 15 minutes early for a smooth check-in</li>
                <li>Your table will be clearly marked with the table number</li>
                <li>Our host will help facilitate introductions</li>
                <li>Enjoy a specially curated 4-course meal</li>
            </ul>
            
            <p>We can't wait to see the connections you'll make!</p>
            
            <p>Best regards,<br>The Mindful Dining Team</p>
        `
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createDiningGroups,
        generateTableAssignmentEmail,
        calculateAverageScore,
        calculateScoreRange
    };
} else {
    // Browser environment
    window.GroupingAlgorithm = {
        createDiningGroups,
        generateTableAssignmentEmail,
        calculateAverageScore,
        calculateScoreRange
    };
}