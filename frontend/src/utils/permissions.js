const roleCapabilities = {
  employee: ['workTasks'],
  volunteer: ['workTasks'],
  trainee: ['workTasks'],
  manager: ['workTasks', 'manageOperations'],
  director: ['workTasks', 'manageOperations'],
};

export function hasPermission(user, capability) {
  const role = user?.role?.toLowerCase();
  return Boolean(role && roleCapabilities[role]?.includes(capability));
}