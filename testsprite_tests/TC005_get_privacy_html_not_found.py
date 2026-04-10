import requests

def test_get_privacy_html_not_found():
    url = "http://localhost:8080/privacy.html"
    try:
        response = requests.get(url, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"

test_get_privacy_html_not_found()