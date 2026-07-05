/* ============================================================
   planner.js — Academic Planner dashboard
   Demonstrates: arrays, functions, DOM manipulation, event
   handling, and localStorage persistence for tasks.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'academicPlanner.tasks.v1';

  /** @type {Array<{id:string,title:string,due:string,priority:string,status:string}>} */
  var tasks = [];

  var form, titleInput, dueInput, priorityInput, columns, stats;

  /* ---------- Seed data (shown on first visit only) ---------- */
  function getSeedTasks() {
    return [
      { id: makeId(), title: 'Finish Data Structures problem set 4', due: addDays(1), priority: 'high', status: 'todo' },
      { id: makeId(), title: 'Draft literature review for capstone', due: addDays(3), priority: 'medium', status: 'todo' },
      { id: makeId(), title: 'Study for Network Security midterm', due: addDays(2), priority: 'high', status: 'in-progress' },
      { id: makeId(), title: 'Submit internship application — SentinelSec', due: addDays(5), priority: 'medium', status: 'in-progress' },
      { id: makeId(), title: 'Register for spring electives', due: addDays(-1), priority: 'low', status: 'done' }
    ];
  }

  function makeId() {
    return 't-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36);
  }

  function addDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- Persistence ---------- */
  function loadTasks() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        tasks = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn('Could not read saved tasks, starting fresh.', err);
    }
    tasks = getSeedTasks();
    saveTasks();
  }

  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Could not save tasks.', err);
    }
  }

  /* ---------- Rendering ---------- */
  function formatDue(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    var opts = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', opts);
  }

  function isOverdue(task) {
    if (task.status === 'done') return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.due + 'T00:00:00') < today;
  }

  function buildTaskCard(task) {
    var card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'done' ? ' completed' : '');
    card.setAttribute('data-priority', task.priority);
    card.setAttribute('data-id', task.id);

    var title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    var meta = document.createElement('div');
    meta.className = 'task-meta';
    var overdueTag = isOverdue(task) ? ' · OVERDUE' : '';
    meta.textContent = 'DUE ' + formatDue(task.due) + ' · ' + task.priority.toUpperCase() + overdueTag;

    var actions = document.createElement('div');
    actions.className = 'task-actions';

    if (task.status !== 'todo') {
      actions.appendChild(makeActionBtn('← Back', function () { moveTask(task.id, task.status === 'done' ? 'in-progress' : 'todo'); }));
    }
    if (task.status !== 'done') {
      var nextLabel = task.status === 'todo' ? 'Start →' : 'Complete ✓';
      actions.appendChild(makeActionBtn(nextLabel, function () { moveTask(task.id, task.status === 'todo' ? 'in-progress' : 'done'); }));
    }
    var delBtn = makeActionBtn('Delete', function () { deleteTask(task.id); });
    delBtn.classList.add('danger');
    actions.appendChild(delBtn);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    return card;
  }

  function makeActionBtn(label, handler) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.addEventListener('click', handler);
    return btn;
  }

  function render() {
    var statuses = ['todo', 'in-progress', 'done'];
    statuses.forEach(function (status) {
      var list = columns[status];
      list.innerHTML = '';
      var filtered = tasks.filter(function (t) { return t.status === status; });

      if (!filtered.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = status === 'todo' ? 'No tasks queued. Add one above.' : 'Nothing here yet.';
        list.appendChild(empty);
      } else {
        filtered
          .sort(function (a, b) { return a.due.localeCompare(b.due); })
          .forEach(function (task) { list.appendChild(buildTaskCard(task)); });
      }

      document.querySelector('[data-count="' + status + '"]').textContent = filtered.length;
    });

    renderStats();
  }

  function renderStats() {
    var total = tasks.length;
    var completed = tasks.filter(function (t) { return t.status === 'done'; }).length;
    var overdue = tasks.filter(isOverdue).length;
    var completionRate = total ? Math.round((completed / total) * 100) : 0;

    setStatValue(stats.total, total);
    setStatValue(stats.completed, completed);
    setStatValue(stats.overdue, overdue);
    setStatValue(stats.rate, completionRate + '%');
  }

  function setStatValue(el, value) {
    if (!el) return;
    var strValue = String(value);
    if (el.textContent === strValue) return;
    el.textContent = strValue;
    el.classList.remove('pulse');
    // Force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add('pulse');
  }

  /* ---------- Task operations ---------- */
  function addTask(title, due, priority) {
    tasks.push({ id: makeId(), title: title, due: due, priority: priority, status: 'todo' });
    saveTasks();
    render();
  }

  function moveTask(id, newStatus) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    task.status = newStatus;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    var cardEl = document.querySelector('.task-card[data-id="' + id + '"]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function commitDelete() {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks();
      render();
    }

    if (cardEl && !reduceMotion) {
      cardEl.classList.add('removing');
      cardEl.addEventListener('animationend', commitDelete, { once: true });
    } else {
      commitDelete();
    }
  }

  /* ---------- Form handling ---------- */
  function handleSubmit(e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    var due = dueInput.value || addDays(0);
    var priority = priorityInput.value || 'medium';
    addTask(title, due, priority);
    form.reset();
    titleInput.focus();
  }

  /* ---------- Init ---------- */
  function init() {
    form = document.getElementById('task-form');
    if (!form) return; // planner.js loaded on a page without the dashboard

    titleInput = form.querySelector('[name="title"]');
    dueInput = form.querySelector('[name="due"]');
    priorityInput = form.querySelector('[name="priority"]');

    columns = {
      'todo': document.querySelector('[data-list="todo"]'),
      'in-progress': document.querySelector('[data-list="in-progress"]'),
      'done': document.querySelector('[data-list="done"]')
    };

    stats = {
      total: document.querySelector('[data-stat="total"]'),
      completed: document.querySelector('[data-stat="completed"]'),
      overdue: document.querySelector('[data-stat="overdue"]'),
      rate: document.querySelector('[data-stat="rate"]')
    };

    form.addEventListener('submit', handleSubmit);
    loadTasks();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

