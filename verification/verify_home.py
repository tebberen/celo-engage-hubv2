from playwright.sync_api import sync_playwright, expect
import time

def verify_home_refactor(page):
    # Go to the app
    # Assuming the app runs on localhost:3000 or similar. I need to find the port.
    # checking package.json for start script might help, but standard is often 3000 or 8080.
    # I'll check package.json first in another step if I wasn't sure.
    # But usually npm start in this environment uses a static server or vite.
    # Let's assume http://localhost:8080 based on common live-server defaults or checking output.
    # I'll check for open ports in the next step if this fails, but let's try 8080.
    page.goto("http://localhost:8080/miniapp.html")

    # Wait for the home section to be active
    home_section = page.locator("#home")
    expect(home_section).to_be_visible()

    # 1. Check "Discover" cards are removed
    # Old structure had #home-discover-ecosystem
    discover_section = page.locator("#home-discover-ecosystem")
    if discover_section.count() > 0:
        expect(discover_section).not_to_be_visible() # Should be gone

    # 2. Check Donate panel exists
    donate_panel = page.locator(".donate-highlight")
    expect(donate_panel).to_be_visible()

    # 3. Check Ecosystem Links list exists
    ecosystem_panel = page.locator(".ecosystem-panel")
    expect(ecosystem_panel).to_be_visible()

    # Check for specific link
    official_link = page.locator("a[data-module-key='official']")
    expect(official_link).to_be_visible()

    # 4. Click an ecosystem link and verify detail box appears
    detail_box = page.locator("#ecosystemDetail")
    expect(detail_box).not_to_be_visible() # Initially hidden

    official_link.click()

    # Wait for animation/display change
    expect(detail_box).to_be_visible()

    # Check title in detail box
    title = page.locator("#ecosystemDetailTitle")
    expect(title).to_have_text("Celo Official Links")

    # Screenshot with detail box open
    page.screenshot(path="verification/verification_detail_open.png")

    # 5. Close the detail box
    close_btn = page.locator("#closeDetailBtn")
    expect(close_btn).to_be_visible()
    close_btn.click()

    expect(detail_box).not_to_be_visible()

    # Screenshot with detail box closed
    page.screenshot(path="verification/verification_detail_closed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_home_refactor(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
