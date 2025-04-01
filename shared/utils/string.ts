/**
 * Returns the initials of a name.
 */
export function initialed(name: string): string {
  // if there is over 2 caps, return the first 2 caps
  const caps = name.match(/[A-Z]/g) || [];
  if (caps.length > 2) {
    return caps.slice(0, 2).join("");
  }
  // if there is 1 space, return the first char of each word
  if (name.includes(" ")) {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }
  // else return the first 2 chars
  return name.split("@")[0].slice(0, 2).toUpperCase();
}
