// Grouping Algorithm for Mindful Dining
// This algorithm groups users based on matching "Intent" and balancing "Roles"
// to create the perfect dynamic dining experience.

/**
 * Main grouping function that takes an array of user objects and returns curated tables
 * @param {Array} users - Array of user objects with detailed personality profiles
 * @param {Object} options - Configuration options for grouping
 * @returns {Array} Array of groups, each containing user objects
 */
function createDiningGroups(users, options = {}) {
    const { eventDate = null, ...configOverrides } = options;

    // Default configuration for table sizes
    const config = {
        minGroupSize: 4, // 4 is the ideal minimum for a balanced dynamic
        maxGroupSize: 8,
        idealGroupSize: 6,
        ...configOverrides
    };

    if (!users || users.length === 0) return [];

    // 1. Filter out invalid users
    const validUsers = users.filter(user =>
        user.personalityResults &&
        user.personalityResults.fullProfile &&
        user.firstName &&
        user.lastName &&
        user.email
    );

    if (validUsers.length === 0) {
        console.warn('No valid users with new personality profiles found.');
        return [];
    }

    // 2. Bucket users by their Core Intent (The most important matching factor)
    // People who want to Network should sit with Networkers. People wanting Deep Connections sit together.
    const intentBuckets = {
        networking: [],
        deep_connection: [],
        casual: []
    };

    validUsers.forEach(user => {
        const intent = user.personalityResults.fullProfile.dominantIntent;
        if (intentBuckets[intent]) {
            intentBuckets[intent].push(user);
        } else {
            intentBuckets.casual.push(user); // Fallback
        }
    });

    const allGroups = [];
    let tableCounter = 1;

    // 3. Form balanced tables within each Intent bucket
    Object.keys(intentBuckets).forEach(intentKey => {
        let usersInBucket = intentBuckets[intentKey];

        // While we have enough people to form a table
        while (usersInBucket.length >= config.minGroupSize) {

            // Try to pull exactly idealGroupSize, or however many are left if it's <= maxGroupSize
            let targetSize = config.idealGroupSize;
            if (usersInBucket.length <= config.maxGroupSize && usersInBucket.length >= config.minGroupSize) {
                targetSize = usersInBucket.length;
            }

            // Extract a balanced group
            const { group, remainingUsers } = extractBalancedGroup(usersInBucket, targetSize);
            usersInBucket = remainingUsers; // Update the bucket with those left behind

            allGroups.push(finalizeGroupObject(group, tableCounter++, intentKey, eventDate));
        }

        // Handle stragglers in this bucket (less than minGroupSize)
        // For a real app, you might mix intents here, but for now we will force them into the last created group of that intent 
        // OR create a small sub-optimal table if no groups exist for that intent.
        if (usersInBucket.length > 0) {
            // Find existing tables with the same intent that aren't completely full
            const compatibleGroups = allGroups.filter(g => g.intent === intentKey && g.members.length < config.maxGroupSize);

            usersInBucket.forEach(straggler => {
                if (compatibleGroups.length > 0) {
                    // Add to the smallest compatible group
                    compatibleGroups.sort((a, b) => a.members.length - b.members.length);
                    compatibleGroups[0].members.push(straggler);
                    compatibleGroups[0].size++;
                } else {
                    // We must create a sub-optimal small table or force mix intents. 
                    // To keep it simple, we create a small table.
                    const existingSmallTable = allGroups.find(g => g.intent === intentKey && g.members.length < config.minGroupSize);
                    if (existingSmallTable) {
                        existingSmallTable.members.push(straggler);
                        existingSmallTable.size++;
                    } else {
                        allGroups.push(finalizeGroupObject([straggler], tableCounter++, intentKey, eventDate));
                    }
                }
            });
        }
    });

    // 4. Final sweep: If any extreme straggler tables exist (e.g. 1 person), fold them into any other table regardless of intent
    const finalOptimizedGroups = [];
    const extremeStragglers = [];

    allGroups.forEach(group => {
        if (group.members.length < config.minGroupSize) {
            extremeStragglers.push(...group.members);
        } else {
            finalOptimizedGroups.push(group);
        }
    });

    extremeStragglers.forEach(straggler => {
        if (finalOptimizedGroups.length > 0) {
            // Sort by size ascending
            finalOptimizedGroups.sort((a, b) => a.members.length - b.members.length);
            finalOptimizedGroups[0].members.push(straggler);
            finalOptimizedGroups[0].size++;
        } else {
            // Literally the only people in the whole system
            finalOptimizedGroups.push(finalizeGroupObject([straggler], 1, 'mixed', eventDate));
        }
    });

    return finalOptimizedGroups;
}

/**
 * Helper to extract a balanced group from a pool of users.
 * Attempts to naturally balance Talkers (Catalyst/Storyteller) with Listeners (Interviewer/Listener)
 */
function extractBalancedGroup(userPool, targetSize) {
    const group = [];
    const remainingUsers = [...userPool];

    // Track what roles we currently have at the table
    const tableRoles = {
        catalyst: 0,
        storyteller: 0,
        interviewer: 0,
        listener: 0
    };

    for (let i = 0; i < targetSize; i++) {
        if (remainingUsers.length === 0) break;

        // Figure out what the table needs right now
        // A perfect table is balanced between Output (catalyst/storyteller) and Input (interviewer/listener)
        const outputEnergy = tableRoles.catalyst + tableRoles.storyteller;
        const inputEnergy = tableRoles.interviewer + tableRoles.listener;

        let preferredRoles = [];
        if (outputEnergy > inputEnergy) {
            // We have too many talkers, find a listener/interviewer
            preferredRoles = ['interviewer', 'listener', 'storyteller', 'catalyst'];
        } else {
            // We need a conversation starter
            preferredRoles = ['catalyst', 'storyteller', 'interviewer', 'listener'];
        }

        // Find the first user in the remaining pool that matches the highest preferred role we can find
        let userIndexToPull = -1;
        for (const role of preferredRoles) {
            userIndexToPull = remainingUsers.findIndex(u => u.personalityResults.fullProfile.dominantRole === role);
            if (userIndexToPull !== -1) break; // Found someone!
        }

        // If somehow we didn't find anyone (should be impossible), just grab the first person
        if (userIndexToPull === -1) userIndexToPull = 0;

        // Extract them
        const user = remainingUsers.splice(userIndexToPull, 1)[0];
        group.push(user);
        tableRoles[user.personalityResults.fullProfile.dominantRole]++;
    }

    return { group, remainingUsers };
}

/**
 * Formats the final group object for the UI
 */
function finalizeGroupObject(members, tableNum, intent, eventDate) {
    // Calculate new average energy for the UI to display
    const sum = members.reduce((acc, user) => acc + (user.personalityResults?.score || 0), 0);
    const average = members.length > 0 ? Math.round(sum / members.length) : 0;

    return {
        id: `group_${Date.now()}_${tableNum}`,
        members: members,
        size: members.length,
        intent: intent,
        averageScore: average,
        createdAt: new Date().toISOString(),
        tableAssignment: `Table ${tableNum} (${intent.replace('_', ' ')})`,
        eventDate
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
            <p>We're excited to confirm your naturally balanced table assignment for our Mindful Dining experience!</p>
            
            <h3>Event Details:</h3>
            <ul>
                <li><strong>Date:</strong> ${eventDetails.date}</li>
                <li><strong>Time:</strong> ${eventDetails.time}</li>
                <li><strong>Table Concept:</strong> ${group.intent.replace('_', ' ').toUpperCase()}</li>
            </ul>
            
            <h3>Your Dining Companions:</h3>
            <p>Based on your intent and conversational style, you'll be dining with:</p>
            <p><em>${memberNames}</em></p>
            
            <p>We've carefully curated this table to ensure a dynamic, engaging, and perfectly balanced evening.</p>
        `
    };
}

// Export functions based on environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createDiningGroups,
        generateTableAssignmentEmail
    };
} else {
    window.GroupingAlgorithm = {
        createDiningGroups,
        generateTableAssignmentEmail
    };
}
