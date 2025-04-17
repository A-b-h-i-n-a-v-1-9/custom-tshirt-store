import socket

# IP and Port
HOST = "82.25.105.26"
PORT = 1337

def main():
    try:
        # Create a TCP socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((HOST, PORT))
        print(f"[+] Connected to {HOST}:{PORT}")

        while True:
            # Receive data from the server
            data = s.recv(4096)
            if not data:
                print("[-] Connection closed by server.")
                break

            # Print server response
            print(data.decode(), end='')

            # Take input from user
            user_input = input()
            s.sendall((user_input + "\n").encode())

    except KeyboardInterrupt:
        print("\n[!] Disconnected.")
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        s.close()

if __name__ == "__main__":
    main()
