import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';

function TestComponent() {
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  return (
    <div>
      <span data-testid="count">{unreadCount}</span>
      <span data-testid="total">{notifications.length}</span>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} data-testid={`notif-${n.id}`}>
            {n.title} - {n.read ? 'read' : 'unread'}
          </li>
        ))}
      </ul>
      <button data-testid="add" onClick={() => addNotification({ title: 'New Alert', message: 'Test' })}>Add</button>
      <button data-testid="mark-read" onClick={() => notifications[0] && markAsRead(notifications[0].id)}>Mark Read</button>
      <button data-testid="mark-all" onClick={markAllAsRead}>Mark All</button>
      <button data-testid="clear" onClick={clearNotifications}>Clear</button>
    </div>
  );
}

describe('NotificationContext', () => {
  it('starts with empty notifications', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('adds a notification', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('1');
    expect(screen.getByText(/New Alert/)).toBeInTheDocument();
  });

  it('marks a notification as read', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('add'));
    expect(screen.getByText(/unread/)).toBeInTheDocument();
    await user.click(screen.getByTestId('mark-read'));
    expect(screen.getByText(/read/)).toBeInTheDocument();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('marks all notifications as read', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('add'));
    await user.click(screen.getByTestId('add'));
    expect(screen.getByTestId('count').textContent).toBe('2');

    await user.click(screen.getByTestId('mark-all'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('clears all notifications', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('add'));
    await user.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
