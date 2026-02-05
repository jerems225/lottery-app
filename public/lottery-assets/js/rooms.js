document.addEventListener('DOMContentLoaded', () => {
    const openCreateBtn = document.getElementById('open-create-room');
    const roomModal = document.getElementById('create-room-modal');
    const closeModal = roomModal.querySelector('.close-modal');
    const createForm = document.getElementById('create-room-form');

    // Number input handlers
    const plusBtn = document.querySelector('.plus');
    const minusBtn = document.querySelector('.minus');
    const playersInput = document.getElementById('room-min-players');

    plusBtn.addEventListener('click', () => {
        playersInput.value = parseInt(playersInput.value) + 1;
    });

    minusBtn.addEventListener('click', () => {
        if (playersInput.value > 2) {
            playersInput.value = parseInt(playersInput.value) - 1;
        }
    });

    // Modal display
    openCreateBtn.addEventListener('click', () => {
        roomModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        roomModal.style.display = 'none';
    });

    // Form submission
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const bet = document.getElementById('room-bet').value;
        const players = playersInput.value;

        // Requirement check simulation
        const balance = 235000; // Mock balance
        if (balance < 10) {
            alert("Solde insuffisant (Min 10$)");
            return;
        }

        // Success Simulation
        const newRoom = {
            id: 'ROOM-' + Math.floor(Math.random() * 9000 + 1000),
            creator: "Me",
            bet: bet,
            players: `1 / ${players}`,
            progress: (1 / players) * 100
        };

        addRoomToGrid(newRoom);
        roomModal.style.display = 'none';
        alert("Salle créée avec succès !");
    });
});

function addRoomToGrid(room) {
    const container = document.getElementById('rooms-container');
    const html = `
        <div class="room-box">
            <div class="room-header">
                <span class="room-id">#${room.id}</span>
                <span class="status-badge">New</span>
            </div>
            <div class="room-body">
                <div class="creator-info">
                    <img src="https://i.pravatar.cc/100?u=me" alt="Creator">
                    <span>You (Creator)</span>
                </div>
                <div class="room-details">
                    <div class="detail">
                        <span class="lbl">Bet Amount</span>
                        <span class="val gold">${room.bet} $</span>
                    </div>
                    <div class="detail">
                        <span class="lbl">Players</span>
                        <span class="val">${room.players}</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${room.progress}%;"></div>
                </div>
            </div>
            <div class="room-footer">
                <button class="join-room-btn">Waiting for players...</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', html);
}
