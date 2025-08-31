let mainTimerInterval;
let mainTimerRunning = false;
let mainSeconds = 0;
let breakIntervals = {};
let exerciseIntervals = {};
let activeExerciseTimers = {};
let currentDayForExercise = 1;
let exerciseCounters = { 1: 5, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
let setCounters = { 1: 14, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

document.addEventListener('DOMContentLoaded', function () {
    // ================= MAIN TIMER =================
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

    startTimerBtn.addEventListener('click', function () {
        if (!mainTimerRunning) {
            mainTimerInterval = setInterval(updateMainTimer, 1000);
            mainTimerRunning = true;
            startTimerBtn.textContent = "Resume Session";
        }
    });

    pauseTimerBtn.addEventListener('click', function () {
        clearInterval(mainTimerInterval);
        mainTimerRunning = false;
    });

    resetTimerBtn.addEventListener('click', function () {
        clearInterval(mainTimerInterval);
        mainTimerRunning = false;
        mainSeconds = 0;
        mainTimerDisplay.textContent = '00:00:00';
        startTimerBtn.textContent = "Start Session";
    });

    // ================= BREAK TIMERS =================
    const breakButtons = document.querySelectorAll('.start-break');
    breakButtons.forEach(button => {
        button.addEventListener('click', function () {
            const breakDuration = parseInt(this.getAttribute('data-duration'));
            const day = this.getAttribute('data-day');
            const breakTimerDisplay = document.getElementById(`break-timer-${day}`);

            if (breakIntervals[day]) {
                alert("Break timer is already running!");
                return;
            }

            let breakSeconds = breakDuration;
            breakTimerDisplay.textContent = formatTime(breakSeconds);

            breakIntervals[day] = setInterval(function () {
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

    // ================= EXERCISE TIMERS =================
    const exerciseBreakButtons = document.querySelectorAll('.start-exercise-break');
    exerciseBreakButtons.forEach(button => {
        button.addEventListener('click', function () {
            const breakDuration = parseInt(this.getAttribute('data-duration'));
            const exerciseId = this.getAttribute('data-exercise');
            const exerciseTimerDisplay = document.getElementById(`exercise-timer-${exerciseId}`);

            if (activeExerciseTimers[exerciseId]) {
                alert("Exercise break timer is already running!");
                return;
            }

            let breakSeconds = breakDuration;
            exerciseTimerDisplay.textContent = formatTime(breakSeconds);
            activeExerciseTimers[exerciseId] = true;

            exerciseIntervals[exerciseId] = setInterval(function () {
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

    // ================= DAY NAVIGATION =================
    const dayButtons = document.querySelectorAll('.day-btn');
    const dayContents = document.querySelectorAll('.day-content');

    dayButtons.forEach(button => {
        button.addEventListener('click', function () {
            const day = this.getAttribute('data-day');
            dayButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            dayContents.forEach(content => {
                content.style.display = 'none';
                if (content.getAttribute('data-day') === day) {
                    content.style.display = 'block';
                }
            });
        });
    });

    // ================= EDIT MODE =================
    const toggleEditBtn = document.getElementById('toggle-edit');
    const saveChangesBtn = document.getElementById('save-changes');
    const editableItems = document.querySelectorAll('.workout-item');
    const deleteButtons = document.querySelectorAll('.delete-exercise');

    toggleEditBtn.addEventListener('click', function () {
        const isEditable = editableItems[0].getAttribute('contenteditable') === 'true';

        if (isEditable) {
            editableItems.forEach(item => item.setAttribute('contenteditable', 'false'));
            deleteButtons.forEach(btn => btn.style.display = 'none');
            toggleEditBtn.textContent = 'Edit Mode';
            saveChangesBtn.style.display = 'none';
        } else {
            editableItems.forEach(item => item.setAttribute('contenteditable', 'true'));
            deleteButtons.forEach(btn => btn.style.display = 'block');
            toggleEditBtn.textContent = 'Cancel Editing';
            saveChangesBtn.style.display = 'inline-block';
        }
    });

    saveChangesBtn.addEventListener('click', function () {
        saveWorkoutData();
        alert('Your changes have been saved!');
        editableItems.forEach(item => item.setAttribute('contenteditable', 'false'));
        deleteButtons.forEach(btn => btn.style.display = 'none');
        toggleEditBtn.textContent = 'Edit Mode';
        saveChangesBtn.style.display = 'none';
    });

    // ================= MARK COMPLETED =================
    document.querySelectorAll('.weight-input').forEach(input => {
        input.addEventListener('change', function () {
            const workoutItem = this.closest('.workout-item');
            const allInputs = workoutItem.querySelectorAll('.weight-input');
            let allFilled = true;
            allInputs.forEach(input => { if (!input.value) allFilled = false; });
            if (allFilled) workoutItem.classList.add('completed');
            else workoutItem.classList.remove('completed');
        });
    });

    // ================= ADD EXERCISES =================
    const addExerciseButtons = document.querySelectorAll('.add-exercise-btn');
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const cancelAddExercise = document.getElementById('cancel-add-exercise');
    const confirmAddExercise = document.getElementById('confirm-add-exercise');

    addExerciseButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentDayForExercise = this.getAttribute('data-day');
            addExerciseModal.style.display = 'flex';
        });
    });

    cancelAddExercise.addEventListener('click', function () {
        addExerciseModal.style.display = 'none';
    });

    confirmAddExercise.addEventListener('click', function () {
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

        saveWorkoutData();
    });

    // ================= AUTO LOAD =================
    loadWorkoutData();
});

// ============= HELPERS =============
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ============= LOCALSTORAGE =============
function saveWorkoutData() {
    let workoutData = {};

    document.querySelectorAll('.day-content').forEach(dayContent => {
        let day = dayContent.getAttribute('data-day');
        workoutData[day] = [];

        dayContent.querySelectorAll('.workout-item').forEach(item => {
            let title = item.querySelector('.exercise-title').innerText;
            let match = title.match(/(.+?)\s(\d+)×(.+)/);
            let exerciseName = match ? match[1] : title;
            let setsCount = match ? parseInt(match[2]) : item.querySelectorAll('.set').length;
            let repsCount = match ? match[3] : "";
            let breakDuration = 120;

            let exercise = {
                name: exerciseName.trim(),
                setsCount,
                repsCount,
                breakDuration,
                sets: []
            };

            item.querySelectorAll('.weight-input').forEach(input => {
                exercise.sets.push(input.value || "");
            });

            workoutData[day].push(exercise);
        });
    });

    localStorage.setItem("workoutData", JSON.stringify(workoutData));
    console.log("✅ Workout data saved");
}

function loadWorkoutData() {
    let data = localStorage.getItem("workoutData");
    if (!data) return;

    let workoutData = JSON.parse(data);

    Object.keys(workoutData).forEach(day => {
        let exercises = workoutData[day];
        let dayContent = document.querySelector(`.day-content[data-day="${day}"]`);
        if (!dayContent) return;

        // Remove only dynamically added ones
        dayContent.querySelectorAll('.workout-item[data-dynamic="true"]').forEach(item => item.remove());

        exercises.forEach((ex, index) => {
            let workoutItems = dayContent.querySelectorAll('.workout-item');
            let workoutItem = workoutItems[index];

            if (workoutItem) {
                let inputs = workoutItem.querySelectorAll('.weight-input');
                ex.sets.forEach((val, i) => {
                    if (inputs[i]) inputs[i].value = val;
                });
            } else {
                addNewExercise(day, ex.name, ex.setsCount, ex.repsCount, ex.breakDuration, ex.sets);
            }
        });
    });

    console.log("✅ Workout data restored");
}

function clearWorkoutData() {
    if (confirm("Are you sure you want to clear ALL workout data?")) {
        localStorage.removeItem("workoutData");
        document.querySelectorAll('.weight-input').forEach(input => input.value = "");
        document.querySelectorAll('.workout-item[data-dynamic="true"]').forEach(item => item.remove());
        alert("All workout data cleared!");
    }
}

// ============= ADD NEW EXERCISE =============
function addNewExercise(day, name, setsCount, repsCount, breakDuration, savedSets = []) {
    const dayContent = document.querySelector(`.day-content[data-day="${day}"]`);
    const addButton = dayContent.querySelector('.add-exercise-btn');
    const exerciseId = `${day}-${Date.now()}`;

    let setsHtml = '';
    for (let i = 0; i < setsCount; i++) {
        setsHtml += `
            <div class="set">
                <div class="set-number">Set ${i + 1}</div>
                <input type="number" class="weight-input" placeholder="Weight" min="0" value="${savedSets[i] || ''}">
            </div>
        `;
    }

    const exerciseHtml = `
        <div class="workout-item" data-dynamic="true">
            <button class="delete-exercise" style="display:none;">×</button>
            <div class="exercise-title">${name} ${setsCount}×${repsCount}</div>
            <div class="exercise-content">
                <div class="sets-container">${setsHtml}</div>
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

    addButton.insertAdjacentHTML('beforebegin', exerciseHtml);

    // Attach listeners
    const newBreakBtn = document.querySelector(`.start-exercise-break[data-exercise="${exerciseId}"]`);
    newBreakBtn.addEventListener('click', function () {
        let breakSeconds = breakDuration;
        const display = document.getElementById(`exercise-timer-${exerciseId}`);
        if (activeExerciseTimers[exerciseId]) {
            alert("Exercise break timer is already running!");
            return;
        }
        activeExerciseTimers[exerciseId] = true;
        exerciseIntervals[exerciseId] = setInterval(function () {
            breakSeconds--;
            display.textContent = formatTime(breakSeconds);
            if (breakSeconds <= 0) {
                clearInterval(exerciseIntervals[exerciseId]);
                delete activeExerciseTimers[exerciseId];
                alert("Break time is over! Start next set.");
            }
        }, 1000);
    });

    const deleteButton = addButton.previousElementSibling.querySelector('.delete-exercise');
    deleteButton.addEventListener('click', function () {
        deleteButton.closest('.workout-item').remove();
        saveWorkoutData();
    });

    // Save whenever new exercise is added
    saveWorkoutData();
}

function resetExerciseTimer(exerciseId) {
    if (exerciseIntervals[exerciseId]) {
        clearInterval(exerciseIntervals[exerciseId]);
        delete activeExerciseTimers[exerciseId];
    }
    const display = document.getElementById(`exercise-timer-${exerciseId}`);
    if (display) display.textContent = '02:00';
}
