function greeterLine(name) {
    const h = new Date().getHours();
    const time = h < 5 ? "up late" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
    const lines = {
        "up late": [`Whoa, ${name}, still up? Let's make it count.`, `Night owl mode activated, ${name}.`],
        morning: [`Good morning, ${name}! Ready to shape the day?`, `Rise and shine, ${name} — KAIROS is with you.`],
        afternoon: [`Hey ${name}! Good afternoon energy in here.`, `Welcome back, ${name} — let's keep the momentum.`],
        evening: [`Good evening, ${name}! One more moment before rest?`, `Evening, ${name} — the day's still got sparkle left.`],
        night: [`Welcome, ${name}. The quiet hours are yours.`, `Hi ${name} — the world's asleep, but you're here.`],
    };
    const set = lines[time];
    return set[Math.floor(Math.random() * set.length)];
}

export { greeterLine };
