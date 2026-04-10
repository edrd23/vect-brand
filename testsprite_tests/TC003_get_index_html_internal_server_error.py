import requests

def test_get_index_html_internal_server_error():
    base_url = "http://localhost:8080"
    url = f"{base_url}/index.html"
    try:
        response = requests.get(url, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    else:
        assert response.status_code == 500, f"Expected status code 500, got {response.status_code}"

test_get_index_html_internal_server_error()