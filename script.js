// StrikeZone Neon Particle Effect and Interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Interactive Neon Dust Particle Background
    const canvas = document.getElementById('neon-dust');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let width, height;
        let particles = [];
        const colors = ['#00f3ff', '#ff00ea', '#ffffff'];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = window.innerWidth < 768 ? 40 : 100;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });
        
        resize();
        initParticles();
        animateParticles();
    }

    // 3. Dashboard Functionality
    const dashboardApp = document.getElementById('dashboard-app');
    if (dashboardApp) {
        // Digital Clock
        const dashClock = document.getElementById('dash-clock');
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            if (dashClock) {
                dashClock.textContent = `${hours}:${minutes}:${seconds}`;
            }
        }
        setInterval(updateClock, 1000);
        updateClock();

        // 4. Lane Modal & Timetable Logic
        const dashboardViews = document.querySelectorAll('.dash-view');
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const breadcrumbActive = document.getElementById('dash-breadcrumb-active');

        function switchTab(tabId) {
            const targetView = document.getElementById(`view-${tabId}`);
            if (!targetView) return;

            // Update nav links
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.getElementById(`nav-${tabId}`);
            if (activeLink) activeLink.classList.add('active');

            // Update views
            dashboardViews.forEach(view => view.classList.remove('active'));
            targetView.classList.add('active');

            // Update breadcrumbs
            if (breadcrumbActive) {
                const label = activeLink ? activeLink.innerText : tabId.charAt(0).toUpperCase() + tabId.slice(1).replace('-', ' ');
                breadcrumbActive.innerText = label;
            }

            // Special actions for specific views
            if (tabId === 'bookings') {
                renderFullBookings();
            }
        }

        // Initialize Nav Listeners
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const id = link.id.replace('nav-', '');
                switchTab(id);
            });
        });

        // Full Bookings Table Renderer
        function renderFullBookings() {
            const tbody = document.getElementById('full-bookings-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            const allBookings = [];
            for (const lane in laneBookings) {
                for (const time in laneBookings[lane]) {
                    allBookings.push({ 
                        lane, 
                        time, 
                        ...laneBookings[lane][time] 
                    });
                }
            }

            // Sort by time
            allBookings.sort((a, b) => a.time.localeCompare(b.time));

            if (allBookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No bookings recorded for today.</td></tr>';
                return;
            }

            allBookings.forEach(b => {
                const tr = document.createElement('tr');
                const statusClass = b.type === 'active' ? 'neon-text-pink' : 'neon-text-blue';
                tr.innerHTML = `
                    <td>Lane ${b.lane}</td>
                    <td>${b.time}</td>
                    <td>${b.teamName || 'Independent'}</td>
                    <td class="${statusClass}">${b.type.toUpperCase()}</td>
                    <td><button class="cta-button btn-small outline-glow view-lane-btn" data-lane="${b.lane}">VIEW LANE</button></td>
                `;
                tr.querySelector('.view-lane-btn').addEventListener('click', () => {
                   switchTab('overview');
                   // Open modal for specific lane
                   const laneBox = document.querySelector(`.lane-box:nth-child(${parseInt(b.lane)})`);
                   if (laneBox) laneBox.click();
                });
                tbody.appendChild(tr);
            });
        }

        const modal = document.getElementById('lane-modal');
        const closeBtn = document.querySelector('.close-modal');
        const saveBtn = document.getElementById('save-lane-btn');
        const slotsContainer = document.getElementById('slots-container');
        const modalLaneTitle = document.getElementById('modal-lane-title');

        const slots = [];
        for (let i = 9; i <= 23; i++) {
            const hourStr = i < 10 ? `0${i}` : `${i}`;
            slots.push(`${hourStr}:00`);
            if (i < 24) { // Allow all intervals except past midnight
                slots.push(`${hourStr}:15`);
                slots.push(`${hourStr}:30`);
                slots.push(`${hourStr}:45`);
            }
        }

        // Mock state: store bookings per lane per time slot
        let laneBookings = {};
        let totalBookingsCounter = 0;

        const resetBookingsBtn = document.getElementById('reset-bookings-btn');
        if (resetBookingsBtn) {
            resetBookingsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear ALL bookings and arrivals for today?')) {
                    laneBookings = {};
                    totalBookingsCounter = 0;
                    updateDashboardLanes();
                    updateDashboardStats(); // This now handles arrivals and counters
                }
            });
        }

        function updateDashboardStats() {
            const activeLanesEl = document.getElementById('stat-active-lanes-val');
            const bookedLanesEl = document.getElementById('stat-booked-lanes-val');
            const waitlistEl = document.getElementById('stat-waitlist');
            const bookingsEl = document.getElementById('stat-today-bookings');

            // 1. Active & Booked Lanes
            let activeCount = 0;
            let bookedCount = 0;
            const totalLanes = 16;
            for (let i = 1; i <= totalLanes; i++) {
                const laneNum = i < 10 ? `0${i}` : `${i}`;
                const bookings = laneBookings[laneNum] || {};
                let isLaneActive = false;
                let isLaneBooked = false;

                for (const slot in bookings) {
                    const type = bookings[slot].type;
                    // Active status: currently playing, service, or cleaning
                    if (type === 'active' || type === 'service' || type === 'cleaning') isLaneActive = true;
                    // Booked status: reserved for later
                    if (type === 'reserve') isLaneBooked = true;
                }

                if (isLaneActive) activeCount++;
                if (isLaneBooked) bookedCount++;
            }

            if (activeLanesEl) activeLanesEl.textContent = `${activeCount} / ${totalLanes}`;
            if (bookedLanesEl) bookedLanesEl.textContent = `${bookedCount} / ${totalLanes}`;

            const consoleBadge = document.getElementById('stat-lanes-active-console');
            if (consoleBadge) {
                const laneText = activeCount === 1 ? 'Lane' : 'Lanes';
                consoleBadge.textContent = `${activeCount} ${laneText} Active`;
            }

            // Sync Arrivals Table from State
            if (typeof updateArrivalsTable === 'function') updateArrivalsTable();

            // 2. Waiting List
            const arrivalsTbody = document.getElementById('arrivals-tbody');
            let waitCount = 0;
            if (arrivalsTbody) {
                waitCount = arrivalsTbody.querySelectorAll('tr:not(.empty-row)').length;
            }
            if (waitlistEl) waitlistEl.textContent = waitCount;

            // 3. Today's Bookings
            if (bookingsEl) bookingsEl.textContent = totalBookingsCounter;
        }

        function updateDashboardLanes() {
            const laneGrids = document.querySelectorAll('.lane-grid');
            if (laneGrids.length === 0) return;
            
            laneGrids.forEach(grid => {
                grid.querySelectorAll('.lane-box').forEach(box => {
                    const laneNum = box.querySelector('.lane-num').innerText;
                    const bookingsForLane = laneBookings[laneNum] || {};
                    
                    let currentState = 'available';
                    let stateTime = '';
                    
                    for (const time in bookingsForLane) {
                        const b = bookingsForLane[time];
                        if (b.type === 'active') { currentState = 'active'; stateTime = time; break; }
                        if (b.type === 'service' && currentState !== 'active') { currentState = 'service'; stateTime = time; }
                        if (b.type === 'cleaning' && currentState !== 'active' && currentState !== 'service') { currentState = 'cleaning'; stateTime = time; }
                        if (b.type === 'reserve' && currentState === 'available') { currentState = 'reserve'; stateTime = time; }
                    }

                    const isSelected = typeof selectedLanes !== 'undefined' && selectedLanes.has(laneNum);
                    const baseClass = isSelected ? 'lane-box selected' : 'lane-box';

                    const badge = box.querySelector('.status-badge');
                    if (currentState === 'active') {
                        box.className = `${baseClass} use`;
                        badge.className = 'status-badge ping-pink';
                        badge.innerText = 'Active';
                    } else if (currentState === 'service') {
                        box.className = `${baseClass} cleaning`;
                        badge.className = 'status-badge';
                        badge.style.color = '#b44dff';
                        badge.innerText = 'Service';
                    } else if (currentState === 'cleaning') {
                        box.className = `${baseClass} cleaning`;
                        badge.className = 'status-badge warn-yellow';
                        badge.style.color = '';
                        badge.innerText = 'Cleaning';
                    } else if (currentState === 'reserve') {
                        box.className = `${baseClass} reserved`;
                        badge.className = 'status-badge ping-pink';
                        badge.style.color = '';
                        badge.innerText = `Reserved (${stateTime})`;
                    } else {
                        box.className = `${baseClass} available`;
                        badge.className = 'status-badge normal-blue';
                        badge.style.color = '';
                        badge.innerText = 'Available';
                    }
                });
            });

            updateDashboardStats();
        }

        function renderTimetable(laneNum) {
            slotsContainer.innerHTML = '';
            if (!laneBookings[laneNum]) laneBookings[laneNum] = {};

            slots.forEach(time => {
                const booking = laneBookings[laneNum][time];
                const isBooked = !!booking;
                
                const slotDiv = document.createElement('div');
                slotDiv.className = `time-slot ${isBooked ? 'booked' : ''}`;
                
                slotDiv.innerHTML = `
                    <div class="slot-header">
                        <span class="slot-time">${time}</span>
                        <span class="slot-status" style="color: ${isBooked ? 'inherit' : '#00ff66'}; font-weight: bold;">${isBooked ? 'Booked' : 'Available'}</span>
                    </div>
                `;

                if (isBooked) {
                    const type = booking.type || 'reserve';
                    const detailsDiv = document.createElement('div');
                    detailsDiv.className = 'slot-details';
                    
                    if (type === 'reserve' || type === 'active') {
                        const isRes = type === 'reserve';
                        slotDiv.querySelector('.slot-status').innerText = isRes ? 'Reserved' : 'Active';
                        slotDiv.querySelector('.slot-status').style.color = isRes ? 'var(--neon-pink)' : '#ffffff';
                        
                        const playerListHtml = booking.players.map(p => {
                            const name = typeof p === 'object' ? p.name : p;
                            const hasBumpers = typeof p === 'object' ? p.bumpers : false;
                            return `<span>${name}${hasBumpers ? '<span class="bumper-tag" title="Bumpers Active">B</span>' : ''}</span>`;
                        }).join(', ') || 'None listed';

                        detailsDiv.innerHTML = `
                            <p>Team: <span>${booking.teamName}</span></p>
                            <p>Players (<span style="color: #fff;">${booking.numPlayers}</span>): ${playerListHtml}</p>
                            <p>Duration: <span style="color: #00f3ff;">${booking.duration || '60'} mins</span></p>
                            <div style="display: flex; gap: 0.5rem; width: 100%;">
                                ${isRes ? '<button class="cta-button btn-small btn-white activate-reservation" style="margin-top: 0.8rem; padding: 0.4rem; flex: 1;">Activate</button>' : ''}
                                <button class="cta-button btn-small btn-red cancel-booking" style="margin-top: 0.8rem; padding: 0.4rem; flex: 1;">${isRes ? 'Unbook' : 'Clear'}</button>
                            </div>
                        `;
                    } else {
                        slotDiv.querySelector('.slot-status').innerText = type.charAt(0).toUpperCase() + type.slice(1);
                        detailsDiv.innerHTML = `<button class="cta-button btn-small btn-red cancel-booking" style="margin-top: 0.8rem; padding: 0.4rem 1rem; width: 100%;">Clear</button>`;
                    }
                    
                    slotDiv.appendChild(detailsDiv);
                    detailsDiv.querySelector('.cancel-booking').addEventListener('click', (e) => {
                        e.stopPropagation();
                        delete laneBookings[laneNum][time];
                        
                        renderTimetable(laneNum);
                        updateDashboardStats(); // This handles arrivals and stat cards
                    });

                    const actBtn = detailsDiv.querySelector('.activate-reservation');
                    if (actBtn) {
                        actBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            laneBookings[laneNum][time].type = 'active';
                            
                            renderTimetable(laneNum);
                            updateDashboardStats(); // This removes it from arrivals automatically
                        });
                    }
                } else {
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'action-selector';
                    actionDiv.style.display = 'none';
                    actionDiv.innerHTML = `
                        <button class="cta-button btn-small btn-blue action-btn" data-action="reserve">Reserve</button>
                        <button class="cta-button btn-small btn-yellow action-btn" data-action="cleaning">Cleaning</button>
                        <button class="cta-button btn-small btn-white action-btn" data-action="active">Activate</button>
                        <button class="cta-button btn-small btn-purple action-btn" data-action="service">Service</button>
                    `;
                    slotDiv.appendChild(actionDiv);

                    const formDiv = document.createElement('div');
                    formDiv.className = 'booking-form';
                    formDiv.style.display = 'none';
                    formDiv.innerHTML = `
                        <div style="margin-bottom: 0.8rem;">
                            <label style="font-size: 0.8rem; color: #aaa; display: block; margin-bottom: 0.3rem;">Team Name</label>
                            <input type="text" class="form-input team-name-input" placeholder="e.g. Neon Strikers" style="width: 100%;">
                        </div>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.8rem;">
                            <div style="flex: 1;">
                                <label style="font-size: 0.8rem; color: #aaa; display: block; margin-bottom: 0.3rem;">Players</label>
                                <select class="form-select players-select" style="width: 100%;">
                                    <option value="1">1 Player</option>
                                    <option value="2">2 Players</option>
                                    <option value="3">3 Players</option>
                                    <option value="4" selected>4 Players</option>
                                    <option value="5">5 Players</option>
                                    <option value="6">6 Players</option>
                                </select>
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 0.8rem; color: #aaa; display: block; margin-bottom: 0.3rem;">Time (min)</label>
                                <input type="number" class="form-input duration-input" value="60" style="width: 100%;">
                            </div>
                        </div>
                        <div class="player-names-container" style="margin-bottom: 0.8rem;">
                            <label style="font-size: 0.8rem; color: #aaa; display: block; margin-bottom: 0.3rem;">Player Names</label>
                            <div class="player-inputs-wrapper" style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                                <!-- Dynamic inputs here -->
                            </div>
                        </div>
                        <button class="cta-button btn-small btn-green submit-booking" style="width: 100%;">Confirm</button>
                    `;
                    slotDiv.appendChild(formDiv);

                    // Initialize default 4 player inputs
                    const wrapper = formDiv.querySelector('.player-inputs-wrapper');
                    const updatePlayerFields = (count) => {
                        wrapper.innerHTML = '';
                        for(let i=1; i<=count; i++) {
                            const group = document.createElement('div');
                            group.className = 'player-input-group';
                            
                            const inp = document.createElement('input');
                            inp.type = 'text';
                            inp.className = 'form-input player-name-inp';
                            inp.placeholder = `Player ${i}`;
                            inp.style.fontSize = '1.1rem';
                            inp.style.background = 'transparent';
                            inp.style.border = 'none';
                            inp.style.padding = '0';
                            inp.style.flex = '1';
                            
                            const bumperWrap = document.createElement('div');
                            bumperWrap.className = 'bumper-toggle-wrap';
                            bumperWrap.innerHTML = `
                                <label>BUMP</label>
                                <input type="checkbox" class="bumper-checkbox">
                            `;
                            
                            group.appendChild(inp);
                            group.appendChild(bumperWrap);
                            wrapper.appendChild(group);
                        }
                    };
                    updatePlayerFields(4);

                    formDiv.querySelector('.players-select').addEventListener('change', (e) => {
                        updatePlayerFields(parseInt(e.target.value));
                    });

                    slotDiv.addEventListener('click', (e) => {
                        if (formDiv.contains(e.target) || actionDiv.contains(e.target)) return;
                        actionDiv.style.display = actionDiv.style.display === 'none' ? 'flex' : 'none';
                        formDiv.style.display = 'none';
                    });

                    let currentFormType = 'reserve';
                    actionDiv.querySelectorAll('.action-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const action = btn.getAttribute('data-action');
                            if (action === 'reserve' || action === 'active') {
                                currentFormType = action;
                                actionDiv.style.display = 'none';
                                formDiv.style.display = 'block';
                            } else {
                                laneBookings[laneNum][time] = { type: action };
                                renderTimetable(laneNum);
                            }
                        });
                    });

                    formDiv.querySelector('.submit-booking').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const team = formDiv.querySelector('.team-name-input').value || 'Unknown';
                        const playersCount = formDiv.querySelector('.players-select').value;
                        const duration = formDiv.querySelector('.duration-input').value || '60';
                        const playerGroups = Array.from(formDiv.querySelectorAll('.player-input-group'));
                        const playersData = playerGroups.map(group => {
                            const name = group.querySelector('.player-name-inp').value;
                            const hasBumpers = group.querySelector('.bumper-checkbox').checked;
                            return name.trim() !== '' ? { name: name, bumpers: hasBumpers } : null;
                        }).filter(p => p !== null);
                        
                        laneBookings[laneNum][time] = { 
                            type: currentFormType, 
                            teamName: team, 
                            numPlayers: playersCount, 
                            players: playersData,
                            duration: duration
                        };
                        totalBookingsCounter++;
                        
                        renderTimetable(laneNum);
                        updateDashboardStats(); // This will now sync arrivals too
                    });
                }
                slotsContainer.appendChild(slotDiv);
            });
            updateDashboardLanes();
        }

        // --- Multi-Select & Bulk Actions Logic ---
        let isMultiSelectActive = false;
        let selectedLanes = new Set();

        const multiSelectBtn = document.getElementById('multi-select-btn');
        const bulkBar = document.getElementById('bulk-actions-bar');
        const selectedCountEl = document.getElementById('selected-count');

        function toggleMultiSelectMode() {
            isMultiSelectActive = !isMultiSelectActive;
            multiSelectBtn.innerText = `MULTI-SELECT: ${isMultiSelectActive ? 'ON' : 'OFF'}`;
            multiSelectBtn.classList.toggle('primary-glow', isMultiSelectActive);
            multiSelectBtn.classList.toggle('outline-glow', !isMultiSelectActive);
            
            if (!isMultiSelectActive) {
                clearLaneSelection();
            }
        }

        function toggleLaneSelection(laneNum, element) {
            if (selectedLanes.has(laneNum)) {
                selectedLanes.delete(laneNum);
                element.classList.remove('selected');
            } else {
                selectedLanes.add(laneNum);
                element.classList.add('selected');
            }
            updateBulkBar();
        }

        function clearLaneSelection() {
            selectedLanes.clear();
            document.querySelectorAll('.lane-box.selected').forEach(el => el.classList.remove('selected'));
            updateBulkBar();
        }

        function updateBulkBar() {
            if (selectedCountEl) selectedCountEl.innerText = selectedLanes.size;
            if (bulkBar) {
                if (selectedLanes.size > 0) {
                    bulkBar.classList.add('active');
                } else {
                    bulkBar.classList.remove('active');
                }
            }
        }

        function applyBulkAction(type) {
            if (selectedLanes.size === 0) return;
            
            if (type === 'reserve') {
                openBulkReserveModal();
                return;
            }

            const now = new Date();
            const hour = now.getHours().toString().padStart(2, '0');
            const timeStr = `${hour}:00`;

            selectedLanes.forEach(laneNum => {
                const finalLane = laneNum.padStart(2, '0');
                if (!laneBookings[finalLane]) laneBookings[finalLane] = {};
                
                if (type === 'active') {
                    // Quick default activation if used in bulk
                    laneBookings[finalLane][timeStr] = {
                        type: 'active',
                        teamName: 'Bulk Activation',
                        numPlayers: 4,
                        players: [{name: 'Player 1'}, {name: 'Player 2'}, {name: 'Player 3'}, {name: 'Player 4'}],
                        duration: 60
                    };
                } else if (type === 'available') {
                    if (laneBookings[finalLane]) {
                        delete laneBookings[finalLane][timeStr];
                    }
                } else {
                    laneBookings[finalLane][timeStr] = { type: type };
                }
            });

            updateDashboardLanes();
            updateDashboardStats();
            clearLaneSelection();
        }

        // --- Bulk Reservation Modal Functions ---
        const bulkModalForm = document.getElementById('bulk-reserve-form');
        const bulkTimeSelect = document.getElementById('bulk-time-select');
        const bulkTeamName = document.getElementById('bulk-team-name');
        const bulkPlayersCount = document.getElementById('bulk-players-count');
        const bulkDuration = document.getElementById('bulk-duration');
        const bulkPlayerInputs = document.getElementById('bulk-player-inputs');
        const confirmBulkBtn = document.getElementById('confirm-bulk-reserve');

        function openBulkReserveModal() {
            const laneList = Array.from(selectedLanes).sort().join(', ');
            modalLaneTitle.innerText = `Bulk Reserve: Lanes ${laneList}`;
            
            // Hide standard timetable, show bulk form
            if (slotsContainer) slotsContainer.style.display = 'none';
            if (bulkModalForm) bulkModalForm.style.display = 'block';
            
            // Clear prior state
            bulkTeamName.value = '';
            
            // Fill time options
            bulkTimeSelect.innerHTML = '';
            for(let h=10; h<=23; h++) {
                const timestr = `${h.toString().padStart(2, '0')}:00`;
                const opt = document.createElement('option');
                opt.value = timestr;
                opt.innerText = timestr;
                bulkTimeSelect.appendChild(opt);
            }

            updateBulkPlayerFields(4);
            modal.classList.add('active');
        }

        function updateBulkPlayerFields(count) {
            if (!bulkPlayerInputs) return;
            bulkPlayerInputs.innerHTML = '';
            for(let i=1; i<=count; i++) {
                const group = document.createElement('div');
                group.className = 'player-input-group';
                
                group.innerHTML = `
                    <div style="flex: 1; display: flex; align-items: center; gap: 0.8rem; background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <span style="color: #aaa; font-size: 0.8rem; width: 60px;">P${i}</span>
                        <input type="text" class="form-input bulk-p-name" placeholder="Name" style="background: transparent; border: none; padding: 0; font-size: 1rem; flex: 1;">
                        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; cursor: pointer; color: #888;">
                            BUMPERS <input type="checkbox" class="bulk-p-bump">
                        </label>
                    </div>
                `;
                bulkPlayerInputs.appendChild(group);
            }
        }

        function confirmBulkBooking() {
            const time = bulkTimeSelect.value;
            const team = bulkTeamName.value.trim() || 'Group Booking';
            const count = parseInt(bulkPlayersCount.value);
            const duration = parseInt(bulkDuration.value);
            
            const players = [];
            document.querySelectorAll('.bulk-p-name').forEach((inp, idx) => {
                const bump = document.querySelectorAll('.bulk-p-bump')[idx].checked;
                players.push({ name: inp.value.trim() || `Player ${idx+1}`, bumpers: bump });
            });

            selectedLanes.forEach(laneNum => {
                const finalLane = laneNum.padStart(2, '0');
                if (!laneBookings[finalLane]) laneBookings[finalLane] = {};
                
                laneBookings[finalLane][time] = {
                    type: 'reserve',
                    teamName: team,
                    numPlayers: count,
                    players: players,
                    duration: duration
                };
            });

            updateDashboardLanes();
            updateDashboardStats();
            clearLaneSelection();
            closeModal();
        }

        if (bulkPlayersCount) {
            bulkPlayersCount.addEventListener('change', (e) => updateBulkPlayerFields(parseInt(e.target.value)));
        }
        if (confirmBulkBtn) {
            confirmBulkBtn.addEventListener('click', confirmBulkBooking);
        }

        // Close logic helper
        function closeModal() {
            modal.classList.remove('active');
            // Reset modal visibility state for next time
            setTimeout(() => {
                if (slotsContainer) slotsContainer.style.display = 'grid';
                if (bulkModalForm) bulkModalForm.style.display = 'none';
            }, 300);
        }

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        if (saveBtn) {
            saveBtn.onclick = closeModal;
        }

        // Listeners for Bulk Bar
        const bulkReserve = document.getElementById('bulk-reserve');
        const bulkCleaning = document.getElementById('bulk-cleaning');
        const bulkActivate = document.getElementById('bulk-activate');
        const bulkService = document.getElementById('bulk-service');
        const bulkAvailable = document.getElementById('bulk-available');
        const bulkCancel = document.getElementById('bulk-cancel');

        if (bulkReserve) bulkReserve.addEventListener('click', () => applyBulkAction('reserve'));
        if (bulkCleaning) bulkCleaning.addEventListener('click', () => applyBulkAction('cleaning'));
        if (bulkActivate) bulkActivate.addEventListener('click', () => applyBulkAction('active'));
        if (bulkService) bulkService.addEventListener('click', () => applyBulkAction('service'));
        if (bulkAvailable) bulkAvailable.addEventListener('click', () => applyBulkAction('available'));
        if (bulkCancel) bulkCancel.addEventListener('click', clearLaneSelection);
        if (multiSelectBtn) multiSelectBtn.addEventListener('click', toggleMultiSelectMode);

        // Ensure standard timetable opens for single clicks
        document.querySelectorAll('.lane-box').forEach(box => {
            box.addEventListener('click', (e) => {
                const laneNum = box.querySelector('.lane-num').innerText;
                
                if (isMultiSelectActive || e.ctrlKey || e.shiftKey) {
                    toggleLaneSelection(laneNum, box);
                } else {
                    if (modalLaneTitle) modalLaneTitle.innerText = `Lane ${laneNum} Timetable`;
                    
                    // Ensure bulk form is hidden and slots are shown
                    if (slotsContainer) slotsContainer.style.display = 'grid';
                    if (bulkModalForm) bulkModalForm.style.display = 'none';
                    
                    renderTimetable(laneNum);
                    modal.classList.add('active');
                }
            });
        });

        if (modal) {
            modal.addEventListener('click', (e) => { 
                if (e.target === modal) closeModal(); 
            });
        }

        // 5. Upcoming Arrivals Logic
        const addArrivalBtn = document.getElementById('add-arrival-btn');
        const arrivalForm = document.getElementById('arrival-form');
        const confirmArrivalBtn = document.getElementById('confirm-arrival-btn');
        const cancelArrivalBtn = document.getElementById('cancel-arrival-btn');
        const arrivalsTbody = document.getElementById('arrivals-tbody');

        function updateArrivalsTable() {
            if (!arrivalsTbody) return;
            
            // Clear current list
            arrivalsTbody.innerHTML = '';
            
            // Collect all reservations across all lanes
            const arrivals = [];
            for (const laneNum in laneBookings) {
                const bookings = laneBookings[laneNum];
                for (const time in bookings) {
                    if (bookings[time].type === 'reserve') {
                        arrivals.push({
                            time: time,
                            name: bookings[time].teamName,
                            party: bookings[time].numPlayers,
                            lane: laneNum
                        });
                    }
                }
            }
            
            // Sort by time
            arrivals.sort((a, b) => a.time.localeCompare(b.time));
            
            if (arrivals.length === 0) {
                const tr = document.createElement('tr');
                tr.className = 'empty-row';
                tr.innerHTML = '<td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No upcoming arrivals currently scheduled.</td>';
                arrivalsTbody.appendChild(tr);
            } else {
                arrivals.forEach(arr => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${arr.time}</td>
                        <td>${arr.name}</td>
                        <td>${arr.party}</td>
                        <td>${arr.lane}</td>
                        <td><button class="cta-button btn-small btn-red remove-arrival" data-lane="${arr.lane}" data-time="${arr.time}">&times;</button></td>
                    `;
                    
                    tr.querySelector('.remove-arrival').addEventListener('click', () => {
                        delete laneBookings[arr.lane][arr.time];
                        updateDashboardLanes();
                        updateDashboardStats();
                    });
                    
                    arrivalsTbody.appendChild(tr);
                });
            }
            
            // Update waitlist counter
            const waitlistEl = document.getElementById('stat-waitlist');
            if (waitlistEl) waitlistEl.textContent = arrivals.length;
        }

        addArrivalBtn.addEventListener('click', () => {
            const current = window.getComputedStyle(arrivalForm).getPropertyValue('display');
            arrivalForm.style.display = current === 'none' ? 'block' : 'none';
        });

        cancelArrivalBtn.addEventListener('click', () => { arrivalForm.style.display = 'none'; });

        // Dynamic Arrival Player Inputs
        const arrivalPlayerInputs = document.getElementById('arrival-player-inputs');
        const updateArrivalPlayerFields = (count) => {
            if (!arrivalPlayerInputs) return;
            arrivalPlayerInputs.innerHTML = '';
            for(let i=1; i<=count; i++) {
                const group = document.createElement('div');
                group.className = 'player-input-group';
                
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = 'form-input player-name-inp';
                inp.placeholder = `Player ${i}`;
                inp.style.fontSize = '1.1rem';
                inp.style.background = 'transparent';
                inp.style.border = 'none';
                inp.style.padding = '0';
                inp.style.flex = '1';
                
                const bumperWrap = document.createElement('div');
                bumperWrap.className = 'bumper-toggle-wrap';
                bumperWrap.innerHTML = `
                    <label>BUMP</label>
                    <input type="checkbox" class="bumper-checkbox">
                `;
                
                group.appendChild(inp);
                group.appendChild(bumperWrap);
                arrivalPlayerInputs.appendChild(group);
            }
        };
        updateArrivalPlayerFields(4);

        const partySelectArr = document.getElementById('arrival-party');
        if (partySelectArr) {
            partySelectArr.addEventListener('change', (e) => {
                updateArrivalPlayerFields(parseInt(e.target.value));
            });
        }

        confirmArrivalBtn.addEventListener('click', () => {
            const h = document.getElementById('arrival-hour').value;
            const m = document.getElementById('arrival-minute').value;
            const n = document.getElementById('arrival-name').value || 'Unknown';
            const p = document.getElementById('arrival-party').value || '1';
            const lRaw = document.getElementById('arrival-lane').value || 'Auto';
            const timeStr = `${h}:${m}`;

            // Collect player data
            const playerGroups = Array.from(document.querySelectorAll('#arrival-player-inputs .player-input-group'));
            const playersData = playerGroups.map(group => {
                const name = group.querySelector('.player-name-inp').value;
                const hasBumpers = group.querySelector('.bumper-checkbox').checked;
                return name.trim() !== '' ? { name: name, bumpers: hasBumpers } : null;
            }).filter(p => p !== null);

            // Sync with Lane Timetables
            let targetLane = lRaw;
            if (lRaw === 'Auto' || lRaw === '') {
                // Find first available lane for this time slot (simplified for now)
                for (let i = 1; i <= 16; i++) {
                    const lNum = i < 10 ? `0${i}` : `${i}`;
                    if (!laneBookings[lNum] || !laneBookings[lNum][timeStr]) {
                        targetLane = lNum;
                        break;
                    }
                }
            }

            const finalLane = targetLane.toString().padStart(2, '0');
            if (!laneBookings[finalLane]) laneBookings[finalLane] = {};
            
            laneBookings[finalLane][timeStr] = {
                type: 'reserve',
                teamName: n,
                numPlayers: p,
                players: playersData,
                duration: '60'
            };
            totalBookingsCounter++;

            updateDashboardLanes();
            updateDashboardStats();
            
            // Clear form and hide
            document.getElementById('arrival-name').value = '';
            document.getElementById('arrival-lane').value = '';
            arrivalForm.style.display = 'none';
        });

        switchTab('overview');
        updateDashboardStats();
    }
});
