from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the file path for miniapp.html
        cwd = os.getcwd()
        file_path = f"file://{cwd}/miniapp.html"

        page.goto(file_path)

        # Inject code to manually trigger the modal since we can't easily perform a transaction in test
        page.evaluate("""
            const modal = document.getElementById('shareSuccessModal');
            if (modal) {
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
            }
        """)

        # Wait for modal to be visible
        page.wait_for_selector("#shareSuccessModal.is-open")

        # Take screenshot
        page.screenshot(path="verification/share_modal.png")
        browser.close()

if __name__ == "__main__":
    run()
