/**
 * Playground Service (Legacy Entry Point)
 *
 * This file has been refactored into smaller modules in lib/services/playground/
 * It now serves as a thin wrapper for backward compatibility.
 *
 * New structure:
 * - lib/services/playground/rooms.ts - Room management
 * - lib/services/playground/participants.ts - Participant handling
 * - lib/services/playground/writings.ts - Writing operations
 * - lib/services/playground/messages.ts - Chat messages
 * - lib/services/playground/subscriptions.ts - Real-time listeners
 * - lib/services/playground/index.ts - Main entry point
 *
 * All exports are re-exported from the modular structure.
 */

export * from './playground';
