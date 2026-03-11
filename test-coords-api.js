async function testSubmitEvent() {
    try {
        console.log("Submitting test event to API...");
        const response = await fetch('http://localhost:3000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Backend Coord Test Event',
                description: 'Verifying coordinates save correctly via POST request.',
                date: '2026-12-31',
                time: '18:00',
                location: 'Test Venue, Mangalore',
                locationCoords: {
                    type: 'Point',
                    coordinates: [74.8560, 12.9141] // lng, lat
                },
                category: 'Drama',
                tags: ['Test'],
                featureImage: 'https://via.placeholder.com/150',
                entry: 'Free',
                meetingLink: ''
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const fs = require('fs');
        fs.writeFileSync('test-output.json', JSON.stringify(data, null, 2));

        if (data.locationCoords && data.locationCoords.coordinates[0] === 74.8560) {
             console.log("SUCCESS: Coordinates were correctly saved.");
        } else {
             console.log("FAILURE: Coordinates were missing.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSubmitEvent();
