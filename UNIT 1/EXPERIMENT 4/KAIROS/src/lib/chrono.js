function chronoPeriod(hour) {
    if (hour >= 5 && hour < 8)
        return { name: "Dawn", icon: "🌅", filter: "brightness(1.05) sepia(0.05) saturate(1.05)" };
    if (hour >= 8 && hour < 17)
        return { name: "Day", icon: "☀", filter: "none" };
    if (hour >= 17 && hour < 20)
        return { name: "Dusk", icon: "🌇", filter: "brightness(0.97) sepia(0.08) saturate(1.08)" };
    return { name: "Night", icon: "🌙", filter: "brightness(0.88) hue-rotate(-4deg)" };
}

export { chronoPeriod };
