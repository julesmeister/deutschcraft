export function getMenuItemClasses(isActive: boolean, isSubmenuItem: boolean = false): string {
  return `
    relative flex items-center px-4 py-3.5 text-sm
    text-gray-900 transition-colors duration-100
    border-t border-gray-200 first:border-t-0
    hover:bg-gray-50 hover:text-gray-950
    active:bg-gray-50 active:text-gray-950
    ${isActive ? 'bg-gray-100 font-medium' : ''}
    ${isSubmenuItem ? 'text-base px-5 py-3' : ''}
  `;
}

export function getSubmenuItemClasses(): string {
  return `
    w-full text-left flex items-center px-5 py-3 text-base
    text-gray-900 transition-colors duration-100
    border-t border-gray-200 first:border-t-0
    hover:bg-gray-100 hover:text-gray-950
  `;
}
