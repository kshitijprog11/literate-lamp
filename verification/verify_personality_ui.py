from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Inject session storage before page loads
    page.add_init_script("""
        sessionStorage.setItem('reservationId', 'verify-ui-123');
        // Also mock localStorage for saving if needed, though we won't go that far
        localStorage.setItem('reservation_verify-ui-123', JSON.stringify({id: 'verify-ui-123', name: 'Test User'}));
    """)

    print("Navigating to personality-test.html")
    page.goto("http://localhost:8000/personality-test.html")

    # Wait for the first question
    print("Waiting for question container")
    page.wait_for_selector("#question-container h3")

    # Check if question text is present
    question_text = page.text_content("#question-container h3")
    print(f"Question 1: {question_text}")

    if not question_text:
        print("Error: Question text is empty")
        browser.close()
        return

    # Take screenshot of first question
    page.screenshot(path="verification/question_1.png")
    print("Screenshot saved: verification/question_1.png")

    # Select an option (first one)
    print("Selecting first option")
    options = page.query_selector_all(".option")
    if len(options) < 4:
        print(f"Error: Expected 4 options, found {len(options)}")

    options[0].click()

    # Check if selected class is applied
    is_selected = "selected" in options[0].get_attribute("class")
    print(f"Option selected visually: {is_selected}")

    # Click Next
    print("Clicking Next")
    page.click("#next-button")

    # Verify next question
    # Wait for text to change? The update is instant.
    # We can check progress text or just wait a bit and check content.
    page.wait_for_timeout(500)

    new_question_text = page.text_content("#question-container h3")
    print(f"Question 2: {new_question_text}")

    if question_text == new_question_text:
        print("Warning: Question text did not change (or is same question)")
    else:
        print("Question changed successfully")

    page.screenshot(path="verification/question_2.png")
    print("Screenshot saved: verification/question_2.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
