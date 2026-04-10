import requests

def test_get_privacy_html_internal_server_error():
    url = "http://localhost:8080/privacy.html"
    try:
        response = requests.get(url, timeout=30)
        assert response.status_code == 500, f"Expected status code 500 but got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {str(e)}"

test_get_privacy_html_internal_server_error()