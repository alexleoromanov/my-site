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
        let cumulativeBookingsCount = 0; // Cumulative tally that doesn't reset on clear

        const resetBookingsBtn = document.getElementById('reset-bookings-btn');
        if (resetBookingsBtn) {
            resetBookingsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear ALL bookings and arrivals for today?')) {
                    laneBookings = {};
                    cumulativeBookingsCount = 0; 
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

                // Check standard bookings
                for (const slot in bookings) {
                    const type = bookings[slot].type;
                    if (type === 'active' || type === 'service' || type === 'cleaning') isLaneActive = true;
                    if (type === 'reserve') isLaneBooked = true;
                }

                // Check tournaments
                if (typeof tournamentsState !== 'undefined') {
                    const activeTourney = tournamentsState.find(t => t.status === 'live' && t.lanes && t.lanes.includes(laneNum));
                    if (activeTourney) isLaneActive = true;
                    
                    const waitingTourney = tournamentsState.find(t => t.status === 'waiting' && t.lanes && t.lanes.includes(laneNum));
                    if (waitingTourney && !isLaneActive) isLaneBooked = true;
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

            if (bookingsEl) bookingsEl.textContent = cumulativeBookingsCount;
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

                    // Tournament Overrides
                    if (typeof tournamentsState !== 'undefined') {
                        const liveT = tournamentsState.find(t => t.status === 'live' && t.lanes && t.lanes.includes(laneNum));
                        if (liveT) {
                            currentState = 'tourney-live';
                        } else {
                            const waitT = tournamentsState.find(t => t.status === 'waiting' && t.lanes && t.lanes.includes(laneNum));
                            if (waitT && (currentState === 'available' || currentState === 'reserve')) {
                                currentState = 'tourney-waiting';
                            }
                        }
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
                    } else if (currentState === 'tourney-live') {
                        box.className = `${baseClass} use`;
                        badge.className = 'status-badge ping-pink';
                        badge.style.color = 'var(--neon-blue)';
                        badge.innerText = 'TOURNEY (LIVE)';
                    } else if (currentState === 'tourney-waiting') {
                        box.className = `${baseClass} reserved`;
                        badge.className = 'status-badge outline-glow';
                        badge.style.color = '#ffc800';
                        badge.innerText = 'TOURNEY (WAIT)';
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
                        
                        cumulativeBookingsCount++;
                        renderTimetable(laneNum);
                        updateDashboardStats(); 
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

        let currentBulkType = 'reserve';

        function applyBulkAction(type) {
            if (selectedLanes.size === 0) return;
            
            if (type === 'reserve') {
                openBulkModal('reserve');
                return;
            }

            if (type === 'active') {
                const now = new Date();
                const currHourStr = `${now.getHours().toString().padStart(2, '0')}:00`;
                
                let activatedAny = false;
                
                selectedLanes.forEach(laneNum => {
                    const finalLane = laneNum.padStart(2, '0');
                    if (laneBookings[finalLane]) {
                        // Find any reservation for this lane
                        const reservationTimes = Object.keys(laneBookings[finalLane]).filter(t => laneBookings[finalLane][t].type === 'reserve');
                        
                        if (reservationTimes.length > 0) {
                            // Pick either the current hour's reservation or the first available one
                            const targetTime = reservationTimes.find(t => t === currHourStr) || reservationTimes[0];
                            laneBookings[finalLane][targetTime].type = 'active';
                            activatedAny = true;
                        }
                    }
                });

                if (activatedAny) {
                    updateDashboardLanes();
                    updateDashboardStats();
                    clearLaneSelection();
                    return; 
                }
                
                // Fallback: If no reservations exists, open the empty form
                openBulkModal('active');
                return;
            }

            const now = new Date();
            const hour = now.getHours().toString().padStart(2, '0');
            const timeStr = `${hour}:00`;

            selectedLanes.forEach(laneNum => {
                const finalLane = laneNum.padStart(2, '0');
                if (type === 'available') {
                    // Clear ALL statuses for this lane
                    laneBookings[finalLane] = {};
                } else {
                    if (!laneBookings[finalLane]) laneBookings[finalLane] = {};
                    laneBookings[finalLane][timeStr] = { type: type };
                }
            });

            updateDashboardLanes();
            updateDashboardStats();
            clearLaneSelection();
        }

        // --- Bulk Action Modal Functions ---
        const bulkModalForm = document.getElementById('bulk-reserve-form');
        const bulkTimeSelect = document.getElementById('bulk-time-select');
        const bulkTimeContainer = document.getElementById('bulk-time-container');
        const bulkTeamName = document.getElementById('bulk-team-name');
        const bulkPlayersCount = document.getElementById('bulk-players-count');
        const bulkDuration = document.getElementById('bulk-duration');
        const bulkPlayerInputs = document.getElementById('bulk-player-inputs');
        const confirmBulkBtn = document.getElementById('confirm-bulk-reserve');

        function openBulkModal(type) {
            currentBulkType = type;
            const laneList = Array.from(selectedLanes).sort().join(', ');
            
            const isReserve = type === 'reserve';
            modalLaneTitle.innerText = isReserve ? `Bulk Reserve: Lanes ${laneList}` : `Bulk Activate: Lanes ${laneList}`;
            confirmBulkBtn.innerText = isReserve ? 'Confirm Multi-Lane Booking' : 'Confirm Multi-Lane Activation';
            
            // Hide standard timetable, show bulk form
            if (slotsContainer) slotsContainer.style.display = 'none';
            if (bulkModalForm) bulkModalForm.style.display = 'block';
            
            // Hide time selection for immediate activations
            if (bulkTimeContainer) bulkTimeContainer.style.display = isReserve ? 'block' : 'none';
            
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
            const now = new Date();
            const currHourStr = `${now.getHours().toString().padStart(2, '0')}:00`;
            const time = currentBulkType === 'active' ? currHourStr : bulkTimeSelect.value;
            
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
                    type: currentBulkType,
                    teamName: team,
                    numPlayers: count,
                    players: players,
                    duration: duration
                };
                cumulativeBookingsCount++;
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
            
            // Collect and group reservations across all lanes
            const groupedArrivals = new Map();

            for (const laneNum in laneBookings) {
                const bookings = laneBookings[laneNum];
                for (const time in bookings) {
                    if (bookings[time].type === 'reserve') {
                        const b = bookings[time];
                        const key = `${time}|${b.teamName}|${b.numPlayers}`;
                        
                        if (!groupedArrivals.has(key)) {
                            groupedArrivals.set(key, {
                                time: time,
                                name: b.teamName,
                                party: b.numPlayers,
                                lanes: [laneNum]
                            });
                        } else {
                            groupedArrivals.get(key).lanes.push(laneNum);
                        }
                    }
                }
            }
            
            const arrivals = Array.from(groupedArrivals.values());
            
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
                    const lanesStr = arr.lanes.sort().join(', ');
                    tr.innerHTML = `
                        <td>${arr.time}</td>
                        <td>${arr.name}</td>
                        <td>${arr.party}</td>
                        <td>${lanesStr}</td>
                        <td><button class="cta-button btn-small btn-red remove-arrival" data-lanes="${lanesStr}" data-time="${arr.time}">&times;</button></td>
                    `;
                    
                    tr.querySelector('.remove-arrival').addEventListener('click', () => {
                        const lanesToRemove = lanesStr.split(/\s*,\s*/);
                        lanesToRemove.forEach(lane => {
                            if (laneBookings[lane]) {
                                delete laneBookings[lane][arr.time];
                            }
                        });
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
            const lanesList = lRaw === 'Auto' || lRaw === '' ? [] : lRaw.split(/\s*,\s*|\s+/).filter(x => x !== "");
            
            if (lanesList.length === 0) {
                // Find first available lane for this time slot (simplified for now)
                for (let i = 1; i <= 16; i++) {
                    const lNum = i < 10 ? `0${i}` : `${i}`;
                    if (!laneBookings[lNum] || !laneBookings[lNum][timeStr]) {
                        lanesList.push(lNum);
                        break;
                    }
                }
            }

            lanesList.forEach(lane => {
                const finalLane = lane.toString().padStart(2, '0');
                if (!laneBookings[finalLane]) laneBookings[finalLane] = {};
                
                    laneBookings[finalLane][timeStr] = {
                        type: 'reserve',
                        teamName: n,
                        numPlayers: p,
                        players: playersData,
                        duration: '60'
                    };
                });
    
                cumulativeBookingsCount++;
                updateDashboardLanes();
                updateDashboardStats();
            
            // Clear form and hide
            document.getElementById('arrival-name').value = '';
            document.getElementById('arrival-lane').value = '';
            arrivalForm.style.display = 'none';
        });

        switchTab('overview');
        updateDashboardStats();

        // 6. Tournament Management Logic
        let tournamentsState = [
            { id: 1, name: "Cosmic Bowl Open '26", status: 'live', stage: 'QUARTERFINALS', players: 32, total: 64, lanes: ['01', '02', '03', '04'], days: ['Sat', 'Sun'], time: '18:00' },
            { id: 2, name: "Saturday Night League", status: 'waiting', stage: 'WAITING', players: 0, total: 48, lanes: ['05', '06'], days: ['Sat'], time: '20:00' }
        ];

        const tourneyListContainer = document.getElementById('tournament-list-container');
        const tourneyModal = document.getElementById('tournament-modal');
        const addTourneyBtn = document.getElementById('add-tournament-btn');
        const saveTourneyBtn = document.getElementById('save-tourney-btn');
        const closeTourneyModal = document.getElementById('close-tourney-modal');

        function renderTournaments() {
            if (!tourneyListContainer) return;
            tourneyListContainer.innerHTML = '';

            tournamentsState.forEach(t => {
                const card = document.createElement('div');
                card.className = `glass-card tourney-card-glow ${t.status === 'live' ? 'active-tourney' : ''}`;
                card.style.padding = '1.5rem';
                card.style.marginBottom = '1.5rem';
                if (t.status === 'live') card.style.borderLeft = '4px solid var(--neon-blue)';

                const progress = t.total > 0 ? (t.players / t.total) * 100 : 0;
                const statusColor = t.status === 'live' ? 'var(--neon-blue)' : (t.status === 'completed' ? '#00ff66' : '#888');

                const laneTags = t.lanes && t.lanes.length > 0 
                    ? `<div style="display: flex; gap: 0.3rem; margin-top: 0.8rem; flex-wrap: wrap;">${t.lanes.map(l => `<span style="font-size: 0.7rem; background: rgba(0,243,255,0.1); color: var(--neon-blue); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(0,243,255,0.2);">LANE ${l}</span>`).join('')}</div>`
                    : '';

                const scheduleInfo = t.days && t.days.length > 0 && t.time
                    ? `<p style="margin: 0.8rem 0 0; font-size: 0.85rem; color: #aaa;"><i class="bi bi-calendar3"></i> ${t.days.join(', ')} @ ${t.time}</p>`
                    : '';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h3 class="${t.status === 'live' ? 'neon-text-blue' : 'text-white'}" style="margin: 0; font-size: 1.2rem;">${t.name}</h3>
                            <p class="text-muted" style="margin: 0.5rem 0 0; font-size: 0.9rem;">
                                Status: <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${t.status}</span> 
                                | Players: ${t.players} / ${t.total}
                            </p>
                            ${scheduleInfo}
                            ${laneTags}
                        </div>
                        <span class="status-badge ${t.status === 'live' ? 'normal-blue' : 'normal-grey'}">${t.stage.toUpperCase()}</span>
                    </div>
                    <div style="margin-top: 1.5rem; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${progress}%; height: 100%; background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></div>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="cta-button btn-small outline-glow edit-tourney-btn" data-id="${t.id}" style="flex: 1;">EDIT</button>
                        <button class="cta-button btn-small btn-red delete-tourney-btn" data-id="${t.id}" style="flex: 0.3;">&times;</button>
                    </div>
                `;

                card.querySelector('.edit-tourney-btn').addEventListener('click', () => openTourneyModal(t.id));
                card.querySelector('.delete-tourney-btn').addEventListener('click', () => deleteTournament(t.id));

                tourneyListContainer.appendChild(card);
            });
        }

        const tourneyStageDisplay = document.getElementById('tourney-stage-display');
        const tourneyStageVal = document.getElementById('tourney-stage-val');
        const stageSelectionBoard = document.getElementById('stage-selection-board');

        function openTourneyModal(editId = null) {
            if (!tourneyModal) return;
            
            const title = document.getElementById('tourney-modal-title');
            const idInput = document.getElementById('tourney-edit-id');
            const nameInput = document.getElementById('tourney-name-input');
            const statusSelect = document.getElementById('tourney-status-select');
            const playersInput = document.getElementById('tourney-players-input');
            const totalInput = document.getElementById('tourney-total-input');
            const timeInput = document.getElementById('tourney-time-input');
            const laneGrid = document.querySelector('.lane-checkbox-grid');
            const dayRow = document.querySelector('.day-checkbox-row');

            // Reset lane grid
            if (laneGrid) {
                laneGrid.innerHTML = '';
                for (let i = 1; i <= 16; i++) {
                    const lNum = i < 10 ? `0${i}` : `${i}`;
                    const label = document.createElement('label');
                    label.className = 'lane-check';
                    label.innerHTML = `<input type="checkbox" value="${lNum}"><span>${lNum}</span>`;
                    laneGrid.appendChild(label);
                }
            }

            // Hide stage board initially
            if (stageSelectionBoard) stageSelectionBoard.style.display = 'none';

            if (editId) {
                const t = tournamentsState.find(x => x.id === editId);
                title.innerText = 'Edit Tournament';
                idInput.value = t.id;
                nameInput.value = t.name;
                statusSelect.value = t.status;
                if (tourneyStageVal) tourneyStageVal.innerText = t.stage;
                playersInput.value = t.players;
                totalInput.value = t.total;
                if (timeInput) timeInput.value = t.time || '18:00';

                // Set lanes
                if (laneGrid && t.lanes) {
                    laneGrid.querySelectorAll('input').forEach(cb => {
                        cb.checked = t.lanes.includes(cb.value);
                    });
                }
                // Set days
                if (dayRow && t.days) {
                    dayRow.querySelectorAll('input').forEach(cb => {
                        cb.checked = t.days.includes(cb.value);
                    });
                }
            } else {
                title.innerText = 'Create Tournament';
                idInput.value = '';
                nameInput.value = '';
                statusSelect.value = 'waiting';
                if (tourneyStageVal) tourneyStageVal.innerText = 'QUALIFIERS';
                playersInput.value = '0';
                totalInput.value = '64';
                if (timeInput) timeInput.value = '18:00';
                if (laneGrid) laneGrid.querySelectorAll('input').forEach(cb => cb.checked = false);
                if (dayRow) dayRow.querySelectorAll('input').forEach(cb => cb.checked = false);
            }

            // Sync active button in board
            const currentStage = tourneyStageVal ? tourneyStageVal.innerText : '';
            document.querySelectorAll('.btn-stage').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-stage') === currentStage);
            });

            tourneyModal.classList.add('active');
        }

        // Toggle Stage Selection Board
        if (tourneyStageDisplay) {
            tourneyStageDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = stageSelectionBoard.style.display === 'none';
                stageSelectionBoard.style.display = isHidden ? 'block' : 'none';
            });
        }

        // Stage Selection Logic
        document.querySelectorAll('.btn-stage').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stage = btn.getAttribute('data-stage');
                if (tourneyStageVal) tourneyStageVal.innerText = stage;
                
                // Update active state
                document.querySelectorAll('.btn-stage').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Hide board
                stageSelectionBoard.style.display = 'none';
            });
        });

        // Close board when clicking outside
        document.addEventListener('click', (e) => {
            if (stageSelectionBoard && !stageSelectionBoard.contains(e.target) && e.target !== tourneyStageDisplay) {
                stageSelectionBoard.style.display = 'none';
            }
        });

        function deleteTournament(id) {
            if (confirm('Are you sure you want to delete this tournament?')) {
                tournamentsState = tournamentsState.filter(t => t.id != id);
                renderTournaments();
                updateDashboardLanes();
                updateDashboardStats();
            }
        }

        if (addTourneyBtn) addTourneyBtn.addEventListener('click', () => openTourneyModal());
        if (closeTourneyModal) closeTourneyModal.addEventListener('click', () => tourneyModal.classList.remove('active'));
        
        if (saveTourneyBtn) {
            saveTourneyBtn.addEventListener('click', () => {
                const id = document.getElementById('tourney-edit-id').value;
                
                // Get selected lanes
                const selectedLanes = [];
                document.querySelectorAll('.lane-check input:checked').forEach(cb => selectedLanes.push(cb.value));
                
                // Get selected days
                const selectedDays = [];
                document.querySelectorAll('.day-check input:checked').forEach(cb => selectedDays.push(cb.value));

                const tourneyData = {
                    name: document.getElementById('tourney-name-input').value || 'New Tournament',
                    status: document.getElementById('tourney-status-select').value,
                    stage: tourneyStageVal ? tourneyStageVal.innerText : 'TBD',
                    players: parseInt(document.getElementById('tourney-players-input').value) || 0,
                    total: parseInt(document.getElementById('tourney-total-input').value) || 64,
                    lanes: selectedLanes,
                    days: selectedDays,
                    time: document.getElementById('tourney-time-input').value || '18:00'
                };

                if (id) {
                    // Update existing
                    const index = tournamentsState.findIndex(t => t.id == id);
                    tournamentsState[index] = { ...tournamentsState[index], ...tourneyData };
                } else {
                    // Create new
                    const newId = tournamentsState.length > 0 ? Math.max(...tournamentsState.map(t => t.id)) + 1 : 1;
                    tournamentsState.push({ id: newId, ...tourneyData });
                }

                tourneyModal.classList.remove('active');
                renderTournaments();
                updateDashboardLanes();
                updateDashboardStats();
            });
        }

        // Initialize
        renderTournaments();
    }
});
