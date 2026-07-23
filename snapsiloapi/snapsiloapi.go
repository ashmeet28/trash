package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

type SentCodeDetails struct {
	e string // Email
	c string // Code
	t int64  // Time
	a bool   // Is Active
}

type SentCodesBox struct {
	m    sync.Mutex
	data []SentCodeDetails
}

func (box *SentCodesBox) addCode(e string) (string, bool) {
	box.m.Lock()
	defer box.m.Unlock()

	var MAX_LIFETIME int64 = 600
	var CLEANUP_TRIGGER int = 10000

	if len(box.data) > CLEANUP_TRIGGER {
		var newData []SentCodeDetails
		for _, d := range box.data {
			if time.Now().Unix() < d.t+MAX_LIFETIME && d.a {
				newData = append(newData, d)
			}
		}
		box.data = newData
	}

	for _, d := range box.data {
		if d.e == e && time.Now().Unix() < d.t+MAX_LIFETIME && d.a {
			return "", false
		}
	}

	var d SentCodeDetails
	d.e = e
	for len(d.c) < 4 {
		d.c += func() string {
			n, err := rand.Int(rand.Reader, big.NewInt(10))
			if err != nil {
				fmt.Println("Error while getting random number")
				os.Exit(1)
			}
			return strconv.FormatInt(n.Int64(), 10)
		}()
	}
	d.t = time.Now().Unix()
	d.a = true

	box.data = append(box.data, d)

	return d.c, true
}

func (box *SentCodesBox) isCodeValid(e string, c string) bool {
	box.m.Lock()
	defer box.m.Unlock()

	var MAX_LIFETIME int64 = 600

	for _, d := range box.data {
		if d.e == e && d.c == c && time.Now().Unix() < d.t+MAX_LIFETIME && d.a {
			d.a = false
			return true
		}
	}

	return false
}

type PublicImage struct {
	name  string
	title string
}

type ActiveSession struct {
	tok string
}

type UserAccount struct {
	emailAddress   string
	activeSessions []ActiveSession
}

type TempDB struct {
	m            sync.Mutex
	userAccounts []UserAccount
}

func findUser(e string)

func main() {
	http.Handle("/", http.FileServer(http.Dir(os.Getenv("SNAP_SILO_API_WEBSITE"))))

	var sentCodes SentCodesBox

	// var tempDB TempDB

	type ReqJSON10 struct {
		EmailAddress string `json:"email_address"`
	}

	http.HandleFunc("POST /api/send-code", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)

		var j ReqJSON10
		err := json.NewDecoder(r.Body).Decode(&j)

		if err != nil {
			return
		}

		c, ok := sentCodes.addCode(j.EmailAddress)

		// TODO: Implement email sending service
		if ok {
			fmt.Println(j.EmailAddress + ":" + c)
		} else {
			fmt.Println(j.EmailAddress + ":" + "not_allowed")
		}
	})

	type ReqJSON11 struct {
		EmailAddress     string `json:"email_address"`
		VerificationCode string `json:"verification_code"`
	}

	type ResJSON11 struct {
		AuthToken string `json:"auth_token"`
	}

	http.HandleFunc("POST /api/sign-in-with-code", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(3 * time.Second)

		var reqJ ReqJSON11
		json.NewDecoder(r.Body).Decode(&reqJ)

		var resJ ResJSON11

		if sentCodes.isCodeValid(reqJ.EmailAddress, reqJ.VerificationCode) {
			b := make([]byte, 16)
			_, err := rand.Read(b)
			if err != nil {
				fmt.Println("Error while getting random bytes")
				os.Exit(1)
			}
			resJ.AuthToken = hex.EncodeToString(b)
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(resJ)
	})

	http.ListenAndServe(":8080", nil)
}
