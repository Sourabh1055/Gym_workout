let mainTimerInterval;
        let mainTimerRunning = false;
        let mainSeconds = 0;
        let breakIntervals = {};
        let exerciseIntervals = {};
        let activeExerciseTimers = {};
        let currentDayForExercise = 1;
        let exerciseCounters = {
            1: 5, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
        };
        let setCounters = {
            1: 14, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
        };
        
        document.addEventListener('DOMContentLoaded', function() {
            // Main workout timer functionality
            const mainTimerDisplay = document.getElementById('main-timer');
            const startTimerBtn = document.getElementById('start-timer');
            const pauseTimerBtn = document.getElementById('pause-timer');
            const resetTimerBtn = document.getElementById('reset-timer');
            
            function updateMainTimer() {
                mainSeconds++;
                const hours = Math.floor(mainSeconds / 3600);
                const minutes = Math.floor((mainSeconds % 3600) / 60);
                const seconds = mainSeconds % 60;
                
                mainTimerDisplay.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            startTimerBtn.addEventListener('click', function() {
                if (!mainTimerRunning) {
                    mainTimerInterval = setInterval(updateMainTimer, 1000);
                    mainTimerRunning = true;
                    startTimerBtn.textContent = "Resume Session";
                }
            });
            
            pauseTimerBtn.addEventListener('click', function() {
                clearInterval(mainTimerInterval);
                mainTimerRunning = false;
            });
            
            resetTimerBtn.addEventListener('click', function() {
                clearInterval(mainTimerInterval);
                mainTimerRunning = false;
                mainSeconds = 0;
                mainTimerDisplay.textContent = '00:00:00';
                startTimerBtn.textContent = "Start Session";
            });
            
            // Break timer functionality
            const breakButtons = document.querySelectorAll('.start-break');
            
            breakButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const breakDuration = parseInt(this.getAttribute('data-duration'));
                    const day = this.getAttribute('data-day');
                    const breakTimerDisplay = document.getElementById(`break-timer-${day}`);
                    
                    // Check if timer is already running
                    if (breakIntervals[day]) {
                        alert("Break timer is already running!");
                        return;
                    }
                    
                    let breakSeconds = breakDuration;
                    breakTimerDisplay.textContent = formatTime(breakSeconds);
                    
                    breakIntervals[day] = setInterval(function() {
                        breakSeconds--;
                        breakTimerDisplay.textContent = formatTime(breakSeconds);
                        
                        if (breakSeconds <= 0) {
                            clearInterval(breakIntervals[day]);
                            delete breakIntervals[day];
                            alert(`Break time is over for Day ${day}! Continue your workout.`);
                        }
                    }, 1000);
                });
            });
            
            // Exercise break timer functionality
            const exerciseBreakButtons = document.querySelectorAll('.start-exercise-break');
            
            exerciseBreakButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const breakDuration = parseInt(this.getAttribute('data-duration'));
                    const exerciseId = this.getAttribute('data-exercise');
                    const exerciseTimerDisplay = document.getElementById(`exercise-timer-${exerciseId}`);
                    
                    // Check if timer is already running
                    if (activeExerciseTimers[exerciseId]) {
                        alert("Exercise break timer is already running!");
                        return;
                    }
                    
                    let breakSeconds = breakDuration;
                    exerciseTimerDisplay.textContent = formatTime(breakSeconds);
                    activeExerciseTimers[exerciseId] = true;
                    
                    exerciseIntervals[exerciseId] = setInterval(function() {
                        breakSeconds--;
                        exerciseTimerDisplay.textContent = formatTime(breakSeconds);
                        
                        if (breakSeconds <= 0) {
                            clearInterval(exerciseIntervals[exerciseId]);
                            delete activeExerciseTimers[exerciseId];
                            alert(`Break time is over for exercise! Start your next set.`);
                        }
                    }, 1000);
                });
            });
            
            // Day navigation
            const dayButtons = document.querySelectorAll('.day-btn');
            const dayContents = document.querySelectorAll('.day-content');
            
            dayButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    
                    // Update active button
                    dayButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show selected day content
                    dayContents.forEach(content => {
                        content.style.display = 'none';
                        if (content.getAttribute('data-day') === day) {
                            content.style.display = 'block';
                        }
                    });
                });
            });
            
            // Edit mode functionality
            const toggleEditBtn = document.getElementById('toggle-edit');
            const saveChangesBtn = document.getElementById('save-changes');
            const editableItems = document.querySelectorAll('.workout-item');
            const deleteButtons = document.querySelectorAll('.delete-exercise');
            
            toggleEditBtn.addEventListener('click', function() {
                const isEditable = editableItems[0].getAttribute('contenteditable') === 'true';
                
                if (isEditable) {
                    // Disable editing
                    editableItems.forEach(item => {
                        item.setAttribute('contenteditable', 'false');
                    });
                    deleteButtons.forEach(btn => {
                        btn.style.display = 'none';
                    });
                    toggleEditBtn.textContent = 'Edit Mode';
                    saveChangesBtn.style.display = 'none';
                } else {
                    // Enable editing
                    editableItems.forEach(item => {
                        item.setAttribute('contenteditable', 'true');
                    });
                    deleteButtons.forEach(btn => {
                        btn.style.display = 'block';
                    });
                    toggleEditBtn.textContent = 'Cancel Editing';
                    saveChangesBtn.style.display = 'inline-block';
                }
            });
            
            saveChangesBtn.addEventListener('click', function() {
                // In a real application, you would save to a database
                // For this example, we'll just show a confirmation
                alert('Your changes have been saved!');
                
                // Disable editing after saving
                editableItems.forEach(item => {
                    item.setAttribute('contenteditable', 'false');
                });
                deleteButtons.forEach(btn => {
                    btn.style.display = 'none';
                });
                toggleEditBtn.textContent = 'Edit Mode';
                saveChangesBtn.style.display = 'none';
            });
            
            // Mark exercise as completed when all sets are filled
            const weightInputs = document.querySelectorAll('.weight-input');
            weightInputs.forEach(input => {
                input.addEventListener('change', function() {
                    const workoutItem = this.closest('.workout-item');
                    const allInputs = workoutItem.querySelectorAll('.weight-input');
                    let allFilled = true;
                    
                    allInputs.forEach(input => {
                        if (!input.value) {
                            allFilled = false;
                        }
                    });
                    
                    if (allFilled) {
                        workoutItem.classList.add('completed');
                    } else {
                        workoutItem.classList.remove('completed');
                    }
                });
            });
            
            // Add exercise functionality
            const addExerciseButtons = document.querySelectorAll('.add-exercise-btn');
            const addExerciseModal = document.getElementById('add-exercise-modal');
            const cancelAddExercise = document.getElementById('cancel-add-exercise');
            const confirmAddExercise = document.getElementById('confirm-add-exercise');
            
            addExerciseButtons.forEach(button => {
                button.addEventListener('click', function() {
                    currentDayForExercise = this.getAttribute('data-day');
                    addExerciseModal.style.display = 'flex';
                });
            });
            
            cancelAddExercise.addEventListener('click', function() {
                addExerciseModal.style.display = 'none';
            });
            
            confirmAddExercise.addEventListener('click', function() {
                const exerciseName = document.getElementById('exercise-name').value;
                const setsCount = parseInt(document.getElementById('sets-count').value);
                const repsCount = document.getElementById('reps-count').value;
                const breakDuration = parseInt(document.getElementById('break-duration').value);
                
                if (!exerciseName) {
                    alert('Please enter an exercise name');
                    return;
                }
                
                addNewExercise(currentDayForExercise, exerciseName, setsCount, repsCount, breakDuration);
                addExerciseModal.style.display = 'none';
                
                // Reset form
                document.getElementById('exercise-name').value = '';
                document.getElementById('sets-count').value = '3';
                document.getElementById('reps-count').value = '';
                document.getElementById('break-duration').value = '120';
            });
            
            // Delete exercise functionality
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-exercise')) {
                    const workoutItem = e.target.closest('.workout-item');
                    const dayContent = workoutItem.closest('.day-content');
                    const day = dayContent.getAttribute('data-day');
                    
                    // Count sets in this exercise
                    const sets = workoutItem.querySelectorAll('.set');
                    setCounters[day] -= sets.length;
                    exerciseCounters[day] -= 1;
                    
                    // Update counters
                    document.getElementById(`exercise-count-${day}`).textContent = exerciseCounters[day];
                    document.getElementById(`set-count-${day}`).textContent = setCounters[day];
                    
                    workoutItem.remove();
                }
            });
        });
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        function resetBreakTimer(dayNumber) {
            // Clear the interval
            if (breakIntervals[dayNumber]) {
                clearInterval(breakIntervals[dayNumber]);
                delete breakIntervals[dayNumber];
            }
            
            // Reset the display
            const breakTimerDisplay = document.getElementById(`break-timer-${dayNumber}`);
            breakTimerDisplay.textContent = '05:00';
        }
        
        function resetExerciseTimer(exerciseId) {
            // Clear the interval
            if (exerciseIntervals[exerciseId]) {
                clearInterval(exerciseIntervals[exerciseId]);
                delete activeExerciseTimers[exerciseId];
            }
            
            // Reset the display
            const exerciseTimerDisplay = document.getElementById(`exercise-timer-${exerciseId}`);
            exerciseTimerDisplay.textContent = '02:00';
        }
        
        function addNewExercise(day, name, setsCount, repsCount, breakDuration) {
            const dayContent = document.querySelector(`.day-content[data-day="${day}"]`);
            const addButton = dayContent.querySelector('.add-exercise-btn');
            
            // Create unique ID for the exercise timer
            const exerciseId = `${day}-${exerciseCounters[day] + 1}`;
            
            // Create sets HTML
            let setsHtml = '';
            for (let i = 1; i <= setsCount; i++) {
                setsHtml += `
                    <div class="set">
                        <div class="set-number">Set ${i}</div>
                        <input type="number" class="weight-input" placeholder="Weight" min="0">
                    </div>
                `;
            }
            
            // Create exercise HTML
            const exerciseHtml = `
                <div class="workout-item">
                    <button class="delete-exercise" style="display:none;">×</button>
                    <div class="exercise-title">${name} ${setsCount}×${repsCount}</div>
                    <div class="exercise-content">
                        <div class="sets-container">
                            ${setsHtml}
                        </div>
                        <div class="exercise-timer">
                            <h4>Exercise Break Timer</h4>
                            <div class="timer-display" id="exercise-timer-${exerciseId}">${formatTime(breakDuration)}</div>
                            <div class="timer-controls">
                                <button class="btn btn-warning start-exercise-break" data-duration="${breakDuration}" data-exercise="${exerciseId}">Start Break</button>
                                <button class="btn btn-danger" onclick="resetExerciseTimer('${exerciseId}')">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert before the add button
            addButton.insertAdjacentHTML('beforebegin', exerciseHtml);
            
            // Update counters
            exerciseCounters[day] += 1;
            setCounters[day] += setsCount;
            document.getElementById(`exercise-count-${day}`).textContent = exerciseCounters[day];
            document.getElementById(`set-count-${day}`).textContent = setCounters[day];
            
            // Add event listeners to the new exercise break button
            const newBreakButton = document.querySelector(`.start-exercise-break[data-exercise="${exerciseId}"]`);
            newBreakButton.addEventListener('click', function() {
                const breakDuration = parseInt(this.getAttribute('data-duration'));
                const exerciseId = this.getAttribute('data-exercise');
                const exerciseTimerDisplay = document.getElementById(`exercise-timer-${exerciseId}`);
                
                // Check if timer is already running
                if (activeExerciseTimers[exerciseId]) {
                    alert("Exercise break timer is already running!");
                    return;
                }
                
                let breakSeconds = breakDuration;
                exerciseTimerDisplay.textContent = formatTime(breakSeconds);
                activeExerciseTimers[exerciseId] = true;
                
                exerciseIntervals[exerciseId] = setInterval(function() {
                    breakSeconds--;
                    exerciseTimerDisplay.textContent = formatTime(breakSeconds);
                    
                    if (breakSeconds <= 0) {
                        clearInterval(exerciseIntervals[exerciseId]);
                        delete activeExerciseTimers[exerciseId];
                        alert(`Break time is over for exercise! Start your next set.`);
                    }
                }, 1000);
            });
            
            // Add event listener to weight inputs for completion tracking
            const weightInputs = document.querySelectorAll(`#exercise-timer-${exerciseId}`).closest('.workout-item').querySelectorAll('.weight-input');
            weightInputs.forEach(input => {
                input.addEventListener('change', function() {
                    const workoutItem = this.closest('.workout-item');
                    const allInputs = workoutItem.querySelectorAll('.weight-input');
                    let allFilled = true;
                    
                    allInputs.forEach(input => {
                        if (!input.value) {
                            allFilled = false;
                        }
                    });
                    
                    if (allFilled) {
                        workoutItem.classList.add('completed');
                    } else {
                        workoutItem.classList.remove('completed');
                    }
                });
            });
            
            // Add event listener to delete button
            const deleteButton = document.querySelector(`#exercise-timer-${exerciseId}`).closest('.workout-item').querySelector('.delete-exercise');
            deleteButton.addEventListener('click', function() {
                const workoutItem = this.closest('.workout-item');
                const dayContent = workoutItem.closest('.day-content');
                const day = dayContent.getAttribute('data-day');
                
                // Count sets in this exercise
                const sets = workoutItem.querySelectorAll('.set');
                setCounters[day] -= sets.length;
                exerciseCounters[day] -= 1;
                
                // Update counters
                document.getElementById(`exercise-count-${day}`).textContent = exerciseCounters[day];
                document.getElementById(`set-count-${day}`).textContent = setCounters[day];
                
                workoutItem.remove();
            });
        }