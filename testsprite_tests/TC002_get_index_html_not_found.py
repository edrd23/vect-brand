import requests

def test_get_index_html_not_found():
    url = "http://localhost:8080/index.html"
    headers = {
        "Accept": "text/html"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 404, f"Expected 404 Not Found, got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_index_html_not_found()