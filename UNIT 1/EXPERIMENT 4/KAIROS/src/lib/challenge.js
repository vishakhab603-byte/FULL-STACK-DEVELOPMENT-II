import { DAILY_CHALLENGES } from "../data/dailyChallenges";

function todaysChallenge() {
    const day = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < day.length; i++)
        hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
    return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length];
}

export { todaysChallenge };
