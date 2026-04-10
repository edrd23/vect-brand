import requests

def test_get_index_html_success():
    url = "http://localhost:8080/index.html"
    headers = {
        "Accept": "text/html"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    content_type = response.headers.get("Content-Type", "")
    assert "text/html" in content_type, f"Expected 'text/html' in Content-Type header, got '{content_type}'"
    assert response.text.strip().startswith("<!DOCTYPE html>") or response.text.strip().startswith("<html"), \
        "Response content does not seem to be valid HTML"

test_get_index_html_success()