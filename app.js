function disableScroll() {
    scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop;
    scrollLeft =
        window.pageXOffset ||
        document.documentElement.scrollLeft,

        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };
}

// Get current time
function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

async function getUserCity() {
    try {
        // Fetch location data from ip-api
        const response = await fetch("http://ip-api.com/json/?lang=fr");
        if (!response.ok) {
            throw new Error("Failed to fetch location data.");
        }

        const data = await response.json();
        if (data && data.city) {
            return data.city; // Return the city name
        } else {
            return "Unknown location";
        }
    } catch (error) {
        console.error("Error fetching location data:", error);
        return "Could not determine city.";
    }
}
async function getCityIdByName(cityName, language = "french") {
    try {
        // Load JSON
        const response = await fetch("available-cities.json");
        if (!response.ok) {
            throw new Error("Failed to load cities data.");
        }

        const data = await response.json();

        // Choose the correct property to match based on language
        const cityKey = language === "arabic" ? "arabicCityName" : "frenchCityName";

        const city = data.cities.find((c) => c[cityKey] === cityName);

        // Return city ID if found
        return city ? city.id : "City not found";
    } catch (error) {
        console.error("Error fetching city data:", error);
        return "Error retrieving city ID.";
    }
}

async function getNextPrayer() {
    try {
        const city = await getUserCity();
        console.log("User's city:", city);
        const cityID = await getCityIdByName(city);
        console.log("User's ID:", cityID);

        const response = await fetch(`https://habous-prayer-times-api.onrender.com/api/v1/prayer-times?cityId=${cityID}`);
        const data = await response.json();

        const cityName = data.data.city.fr;
        const prayerTimes = data.data.timings[0].prayers;

        console.log("Prayer times:", prayerTimes);

        // Get the current time in minutes
        const currentTime = getCurrentTimeInMinutes();

        // Define the prayer times in minutes
        const prayers = [
            { name: "Fajr", time: timeToMinutes(prayerTimes.fajr) },
            { name: "Sunrise", time: timeToMinutes(prayerTimes.sunrise) },
            { name: "Dhuhr", time: timeToMinutes(prayerTimes.dhuhr) },
            { name: "Asr", time: timeToMinutes(prayerTimes.asr) },
            { name: "Maghrib", time: timeToMinutes(prayerTimes.maghrib) },
            { name: "Ishaa", time: timeToMinutes(prayerTimes.ishaa) }
        ];

        // Find the next prayer time
        let nextPrayer = null;
        for (let prayer of prayers) {
            if (prayer.time > currentTime) {
                nextPrayer = prayer;
                break;
            }
        }

        // Display the next prayer or a message indicating no more prayers
        const nextPrayerTextElement = document.getElementById('next-prayer-text');
        if (nextPrayer) {
            nextPrayerTextElement.textContent = `Next prayer is: ${nextPrayer.name} at ${prayerTimes[nextPrayer.name.toLowerCase()]}`;
        } else {
            nextPrayerTextElement.textContent = "No more prayers for today.";
        }

    } catch (error) {
        console.error("Error fetching prayer times:", error);
        const nextPrayerTextElement = document.getElementById('next-prayer-text');
        nextPrayerTextElement.textContent = "Error retrieving prayer times.";
    }
}

getNextPrayer();

window.onload = function() {
    disableScroll();
    formattedTime = getCurrentTimeInMinutes()
    
};

// Handle device orientation
function handleOrientation(event) {
    const compass = document.querySelector('.dip-needle');
    const alpha = event.alpha || 0; // Rotation around the z-axis (0 to 360 degrees)
    
    // Rotate the compass needle based on the alpha value
    compass.style.transform = `rotate(${alpha}deg)`;
}

function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+
        DeviceOrientationEvent.requestPermission()
            .then((response) => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                } else {
                    alert('Permission to access device orientation was denied.');
                }
            })
            .catch((error) => {
                console.error('Error requesting device orientation permission:', error);
            });
    } else {
        // Non-iOS
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

// Trigger request
document.addEventListener('DOMContentLoaded', () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.color = '#fff';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';
        overlay.textContent = 'Tap to enable compass';
        overlay.style.fontSize = '20px';
        overlay.style.cursor = 'pointer';

        overlay.addEventListener('click', () => {
            requestOrientationPermission();
            document.body.removeChild(overlay);
        });

        document.body.appendChild(overlay);
    } else {
        requestOrientationPermission();
    }
});
