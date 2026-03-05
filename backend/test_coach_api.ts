async function testFeedback() {
    try {
        console.log("Logging in as coach...");
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "coach@example.com", password: "password123" })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Token received.");

        console.log("Fetching players for coach...");
        const playersRes = await fetch("http://localhost:3000/api/coach/players", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const players = await playersRes.json();
        console.log("Players:", players);

        if (players.length > 0) {
            const playerId = players[0].id;
            console.log("Sending feedback to player:", playerId);
            const fbRes = await fetch(`http://localhost:3000/api/coach/players/${playerId}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    area: "Batting",
                    feedback: "Testing backend",
                    rating: 5
                })
            });
            const fbData = await fbRes.json();
            console.log("Feedback success:", fbRes.status, fbData);
        } else {
            console.log("No players found to test.");
        }
    } catch (error: any) {
        console.error("Test failed!", error.message);
    }
}

testFeedback();
