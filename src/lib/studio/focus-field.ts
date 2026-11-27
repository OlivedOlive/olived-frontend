/**
 * Jumping from a check to the text that fixes it. The checklist asks for a field; the label editor answers
 * by selecting the block that prints it (its text box then shows in the side panel), otherwise the field's
 * own text box in the list is used. When the text still has a [placeholder], its fill-in box gets the focus.
 */
export const FOCUS_FIELD_EVENT = "studio:focus-field";
export type FocusFieldDetail = { field: string; handled?: boolean };

/** Focuses a text or fill-in box, scrolls it into view and flashes it. */
export function focusText(element: HTMLElement | null) {
  if (!element) return false;
  element.scrollIntoView({ block: "center", behavior: "smooth" });
  element.focus({ preventScroll: true });
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
    if (!detail.handled) focusText(document.getElementById(`fill-${field}`) ?? document.getElementById(`field-${field}`));
  }, 80);
}
