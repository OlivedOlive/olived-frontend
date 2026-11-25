/**
 * Jumping from a check to the text that fixes it. The checklist asks for a field; the label editor answers
 * by selecting the block that prints it (its text box then shows in the side panel), otherwise the field's
 * own text box in the list is used. The placeholder to replace, like [XXXXX], is selected, so typing
 * replaces it straight away.
 */
export const FOCUS_FIELD_EVENT = "studio:focus-field";
export type FocusFieldDetail = { field: string; handled?: boolean };

const PLACEHOLDER = /\[[^\]]+\]/;

/** Focuses a text box, scrolls it into view, selects its first placeholder and flashes it. */
export function focusText(element: HTMLTextAreaElement | HTMLInputElement | null) {
  if (!element) return false;
  element.scrollIntoView({ block: "center", behavior: "smooth" });
  element.focus({ preventScroll: true });
  const match = PLACEHOLDER.exec(element.value);
  if (match && "setSelectionRange" in element) element.setSelectionRange(match.index, match.index + match[0].length);
  element.classList.remove("studio-flash");
  void element.offsetWidth; // restart the animation
  element.classList.add("studio-flash");
  return true;
}

/** Asks for a field to be shown and focused, once the page has switched to the step that edits it. */
export function requestField(field: string) {
  setTimeout(() => {
    const detail: FocusFieldDetail = { field };
    window.dispatchEvent(new CustomEvent(FOCUS_FIELD_EVENT, { detail }));
    // No label editor on this step: use the field's own text box.
    if (!detail.handled) focusText(document.getElementById(`field-${field}`) as HTMLTextAreaElement | null);
  }, 80);
}
