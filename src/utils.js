export function panic(...message) {
  console.error(...message);
  process.exit(1);
}
