package pushcookiesvr

import (
	"fmt"
	"net/http"
	"strings"
    "os"
)

var strValues string
var strUvalues string
var password = os.Getenv("PASSWORD")

func init(){
    if password == "" {
      password = "123456"
    }
  }

func filterCookieValues(cookieValues string, keepKeys []string) string {
	newCookieValues := ""
	pairs := strings.Split(cookieValues, ";")
	for _, pair := range pairs {
		parts := strings.Split(pair, "=")
		key := strings.TrimSpace(parts[0])
		value := strings.Join(parts[1:], "=")
		if contains(keepKeys, key) {
			newCookieValues += key + "=" + value + "; "
		}
	}
	newCookieValues = newCookieValues[:len(newCookieValues)-2]
	return newCookieValues
}

func contains(keys []string, key string) bool {
	for _, k := range keys {
		if k == key {
			return true
		}
	}
	return false
}

func handleSET(w http.ResponseWriter, req *http.Request) {
	pwd := req.URL.Query().Get("pwd")
	if pwd == "" || pwd != password {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid password"))
		return
	}
	keepKeys := []string{"_U", "MUID", "KievRPSSecAuth", "cct", "_RwBf", "SRCHHPGUSR", "WLS"}
	keepKeysU := []string{"_U", "WLS"}
	cookieValues := req.Header.Get("Cookie-Values")
	setValue := filterCookieValues(cookieValues, keepKeys)
	getUValue := filterCookieValues(cookieValues, keepKeysU)

	if setValue != "" {
		strValues = setValue
		if getUValue != "" && !strings.Contains(strUvalues, getUValue) {
			strUvalues += ";" + getUValue
		}
		w.Write([]byte("Set value successfully"))
	} else {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("No Cookie-Values in header"))
	}
}

func handleGET(w http.ResponseWriter, req *http.Request) {
	pwd := req.URL.Query().Get("pwd")
	if pwd == "" || pwd != password {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid password"))
		return
	}
    result := `{"result": {"cookies": "` + strValues + `"}}`
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf("%v", result)))
}

func handleCLS(w http.ResponseWriter, req *http.Request) {
	pwd := req.URL.Query().Get("pwd")
	if pwd == "" || pwd != password {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid password"))
		return
	}
	replacedStr := strings.ReplaceAll(strUvalues, ";", "<br>")

	strValues = ""
	strUvalues = ""

	w.Write([]byte("Clear value successfully\n" + replacedStr))
}

func handleHisU(w http.ResponseWriter, req *http.Request) {
	pwd := req.URL.Query().Get("pwd")
	if pwd == "" || pwd != password {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid password"))
		return
}
	replacedStr := strings.ReplaceAll(strUvalues, ";", "<br>")
	w.Write([]byte("Ukey History:\n" + replacedStr))
}

func handleRoot(w http.ResponseWriter, req *http.Request) {
	w.Write([]byte("Please visit /SET, /GET, or /CLS with ?pwd=xxxxxx"))
}

func main() {
	port := ":7860"
	http.HandleFunc("/SET", handleSET)
	http.HandleFunc("/GET", handleGET)
	http.HandleFunc("/CLS", handleCLS)
	http.HandleFunc("/HisU", handleHisU)
	http.HandleFunc("/", handleRoot)

	fmt.Printf("Server is running on port %s\n", port)
	http.ListenAndServe(port, nil)
}
