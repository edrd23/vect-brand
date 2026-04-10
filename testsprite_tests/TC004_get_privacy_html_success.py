import requests

def test_get_privacy_html_success():
    url = "http://localhost:8080/privacy.html"
    try:
        response = requests.get(url, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        content_type = response.headers.get("Content-Type", "")
        assert "text/html" in content_type.lower(), f"Expected Content-Type to include 'text/html' but got '{content_type}'"
        assert "<html" in response.text.lower(), "Response body does not contain expected HTML content"
        # Additional check for privacy policy specific keywords can be added if known
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_get_privacy_html_success()