import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import App from './App.jsx';

// Integration tests that drive the real app (App → useStore → localStorage
// backend) the way a user would, verifying the behavior we otherwise checked
// only with throwaway browser scripts.

beforeEach(() => localStorage.clear());

// Scope queries to a dashboard section by its anchor id (sec-tasks, etc.).
const section = (id) => within(document.getElementById('sec-' + id));

async function createProject(user, name) {
  await screen.findByText(/Start your first project/i);
  await user.click(screen.getAllByRole('button', { name: /New project/i })[0]);
  await user.type(screen.getByPlaceholderText('Project name'), name);
  await user.click(screen.getByRole('button', { name: /^Create$/ }));
  await screen.findByRole('heading', { name: /Project Overview/i });
}

test('empty picker → create a project → dashboard shows it', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(await screen.findByText(/Start your first project/i)).toBeInTheDocument();
  await createProject(user, 'Cedar Street Build');

  // hero shows the project name; the KPIs start empty
  expect(screen.getByRole('heading', { name: 'Cedar Street Build' })).toBeInTheDocument();
  expect(section('overview').getByText('OPEN TASKS').parentElement).toHaveTextContent('0');
});

test('add and delete a task; the OPEN TASKS KPI reflects it', async () => {
  const user = userEvent.setup();
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  const tasks = () => section('tasks');
  await user.click(tasks().getByRole('button', { name: '+ Add' }));
  await user.type(tasks().getByPlaceholderText('Task title'), 'Pour footings');
  await user.click(tasks().getByRole('button', { name: 'Add' }));

  expect(tasks().getByText('Pour footings')).toBeInTheDocument();
  expect(section('overview').getByText('OPEN TASKS').parentElement).toHaveTextContent('1');

  // delete it (the × button carries a title="Delete task")
  await user.click(tasks().getByTitle('Delete task'));
  await waitFor(() => expect(tasks().queryByText('Pour footings')).not.toBeInTheDocument());
  expect(section('overview').getByText('OPEN TASKS').parentElement).toHaveTextContent('0');
});

test('document search filters the list', async () => {
  const user = userEvent.setup();
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  const docs = () => section('documents');
  const addDoc = async (title) => {
    await user.click(docs().getByRole('button', { name: '+ Add' }));
    await user.type(docs().getByPlaceholderText('Document name'), title);
    await user.click(docs().getByRole('button', { name: 'Save' }));
  };
  await addDoc('Lumber receipt');
  await addDoc('Plumbing invoice');

  expect(docs().getByText('Lumber receipt')).toBeInTheDocument();
  expect(docs().getByText('Plumbing invoice')).toBeInTheDocument();

  await user.type(screen.getByPlaceholderText('Search documents…'), 'lumber');

  expect(docs().getByText('Lumber receipt')).toBeInTheDocument();
  expect(docs().queryByText('Plumbing invoice')).not.toBeInTheDocument();
});

test('add a budget category → the Budget Spent KPI updates (derived)', async () => {
  const user = userEvent.setup();
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  const budget = () => section('budget');
  await user.click(budget().getByRole('button', { name: '+ Add' }));
  await user.type(budget().getByPlaceholderText('Category'), 'Foundation');
  await user.type(budget().getByPlaceholderText('Spent ($)'), '30000');
  await user.type(budget().getByPlaceholderText('Budget ($)'), '60000');
  await user.click(budget().getByRole('button', { name: 'Add' }));

  // KPI is derived from the category: $30.0K / $60.0K, 50% used
  await waitFor(() => expect(section('overview').getByText('$30.0K')).toBeInTheDocument());
  expect(section('overview').getByText('50% used')).toBeInTheDocument();
});

test('vendors: add a contractor with phone/email → tap-to-call/email links', async () => {
  const user = userEvent.setup();
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  const vend = () => section('vendors');
  await user.click(vend().getByRole('button', { name: '+ Add' }));
  await user.type(vend().getByPlaceholderText('Vendor name'), 'Apex Framing');
  await user.type(vend().getByPlaceholderText('Trade'), 'Framing');
  await user.type(vend().getByPlaceholderText('Phone (optional)'), '555-100-2000');
  await user.type(vend().getByPlaceholderText('Email (optional)'), 'apex@build.com');
  await user.click(vend().getByRole('button', { name: 'Add' }));

  expect(vend().getByText('Apex Framing')).toBeInTheDocument();
  expect(vend().getByRole('link', { name: /555-100-2000/ })).toHaveAttribute('href', 'tel:555-100-2000');
  expect(vend().getByRole('link', { name: /apex@build.com/ })).toHaveAttribute('href', 'mailto:apex@build.com');
});

test('schedule: add a phase with dates → it appears on the timeline', async () => {
  const user = userEvent.setup();
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  const sch = () => section('schedule');
  await user.click(sch().getByRole('button', { name: '+ Add' }));
  await user.type(sch().getByPlaceholderText('Phase name'), 'Framing');
  fireEvent.change(sch().getByLabelText('Start date'), { target: { value: '2026-08-01' } });
  fireEvent.change(sch().getByLabelText('End date'), { target: { value: '2026-10-15' } });
  await user.click(sch().getByRole('button', { name: 'Add' }));

  // Timeline (Gantt) is the default view — the phase shows and the
  // "add dates" hint is gone.
  expect(await sch().findByText('Framing')).toBeInTheDocument();
  expect(sch().queryByText(/ADD START & END DATES/i)).not.toBeInTheDocument();
});

test('delete a project from the picker returns to the empty state', async () => {
  const user = userEvent.setup();
  window.confirm = () => true; // project delete asks for confirmation
  render(<App />);
  await createProject(user, 'Cedar Street Build');

  // back to the picker
  await user.click(screen.getByRole('button', { name: /All projects/i }));
  expect(await screen.findByRole('heading', { name: 'Cedar Street Build' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Delete project/i }));
  expect(await screen.findByText(/Start your first project/i)).toBeInTheDocument();
});
