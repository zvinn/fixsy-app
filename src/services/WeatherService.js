// Simulated Weather API
// In production, replace the fetchMock with real fetch from OpenWeatherMap or similar.

export const getWeatherAlert = async (location = "Cairo") => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock logic: Return different alerts based on "random" chance or time of day
    // acting as a smart localized service
    const rand = Math.random();

    if (rand > 0.7) {
        return {
            type: 'rain',
            message: 'أمطار غزيرة متوقعة اليوم! تأكد من سلامة العزل والشبابيك.',
            icon: '⛈️',
            severity: 'high'
        };
    } else if (rand > 0.4 && rand <= 0.7) {
        return {
            type: 'heat',
            message: 'موجة حارة قادمة! افحص تكييفك الآن لتجنب الأعطال.',
            icon: '☀️',
            severity: 'medium'
        };
    } else if (rand > 0.2 && rand <= 0.4) {
        return {
            type: 'dust',
            message: 'رياح ترابية! يفضل تنظيف فلاتر التكييف.',
            icon: '💨',
            severity: 'low'
        };
    }

    return null; // Good weather
};
