'use strict';

const BATCH_SIZE = 25;
const ROW_HEIGHT = 76;
const OVERSCAN = 4;

const state = {
  users: [],
  nextCursor: '0',
  hasMore: true,
  loading: false,
  query: ''
};

const userList = document.querySelector('#userList');
const statusText = document.querySelector('#status');
const countText = document.querySelector('#count');
const loadMoreBtn = document.querySelector('#loadMoreBtn');
const searchInput = document.querySelector('#searchInput');

const spacer = document.createElement('div');
spacer.className = 'virtual-spacer';

const virtualRows = document.createElement('div');
virtualRows.className = 'virtual-rows';

userList.append(spacer, virtualRows);

async function fetchUsersBatch({ cursor = '0', limit = BATCH_SIZE } = {}) {
  const response = await fetch(
    `https://dummyjson.com/users?limit=${limit}&skip=${cursor}`
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const payload = await response.json();

  const users = payload.users.map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email
  }));

  const nextPosition = Number(cursor) + users.length;

  return {
    users,
    nextCursor: nextPosition < payload.total ? String(nextPosition) : null
  };
}

async function loadUsers() {
  if (state.loading || !state.hasMore) return;

  state.loading = true;
  updateStatus('Loading users...');
  loadMoreBtn.disabled = true;

  try {
    const result = await fetchUsersBatch({
      cursor: state.nextCursor,
      limit: BATCH_SIZE
    });

    state.users = [...state.users, ...result.users];
    state.nextCursor = result.nextCursor;
    state.hasMore = result.nextCursor !== null;

    renderVirtualList();

    updateStatus(
      state.hasMore
        ? 'Users loaded. You can load the next batch.'
        : 'All users loaded.'
    );
  } catch (error) {
    updateStatus('Could not load users. Check your internet connection and try again.');
    console.error(error);
  } finally {
    state.loading = false;
    loadMoreBtn.disabled = !state.hasMore;
  }
}

function renderVirtualList() {
  const filteredUsers = state.users.filter(user => {
    const searchableText = `${user.name} ${user.email}`.toLowerCase();
    return searchableText.includes(state.query.toLowerCase());
  });

  const totalHeight = filteredUsers.length * ROW_HEIGHT;
  spacer.style.height = `${totalHeight}px`;

  const visibleCount = Math.ceil(userList.clientHeight / ROW_HEIGHT);
  const firstVisibleIndex = Math.floor(userList.scrollTop / ROW_HEIGHT);
  const startIndex = Math.max(0, firstVisibleIndex - OVERSCAN);
  const endIndex = Math.min(
    filteredUsers.length,
    firstVisibleIndex + visibleCount + OVERSCAN
  );

  virtualRows.style.transform = `translateY(${startIndex * ROW_HEIGHT}px)`;
  virtualRows.replaceChildren();

  const fragment = document.createDocumentFragment();

  for (const user of filteredUsers.slice(startIndex, endIndex)) {
    const row = document.createElement('article');
    row.className = 'user-row';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = user.name.slice(-2);

    const info = document.createElement('div');
    info.className = 'user-info';

    const name = document.createElement('strong');
    name.textContent = user.name;

    const email = document.createElement('span');
    email.textContent = user.email;

    info.append(name, email);
    row.append(avatar, info);
    fragment.append(row);
  }

  virtualRows.append(fragment);

  countText.textContent = `${state.users.length} loaded · ${filteredUsers.length} shown`;
  loadMoreBtn.textContent = state.hasMore ? 'Load more users' : 'No more users';
}

function updateStatus(message) {
  statusText.textContent = message;
}

function makeLoadHandler(currentState, loadFunction) {
  return function handleLoadClick() {
    if (!currentState.loading && currentState.hasMore) {
      loadFunction();
    }
  };
}

const handleLoadMore = makeLoadHandler(state, loadUsers);
loadMoreBtn.addEventListener('click', handleLoadMore);

userList.addEventListener('scroll', () => renderVirtualList());

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  userList.scrollTop = 0;
  renderVirtualList();
});

const commentForm = document.querySelector('#commentForm');
const commentInput = document.querySelector('#commentInput');
const comments = document.querySelector('#comments');

commentForm.addEventListener('submit', event => {
  event.preventDefault();

  const commentText = commentInput.value.trim();
  if (!commentText) return;

  const comment = document.createElement('p');
  comment.className = 'comment';
  comment.textContent = commentText;

  comments.append(comment);
  commentInput.value = '';
});

loadUsers();
