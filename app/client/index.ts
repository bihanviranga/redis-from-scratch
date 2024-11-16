import net from "net";

export class Client {
  private client: net.Socket | null = null;
  private isConnected: boolean = false;
  private readonly host: string;
  private readonly port: number;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }

  // Initialize and connect to the server
  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.isConnected) {
        return resolve();
      }

      this.client = new net.Socket();

      this.client.connect(this.port, this.host, () => {
        this.isConnected = true;
        console.log(`[client]\tConnected to ${this.host}:${this.port}`);
        resolve();
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        console.error("[client]\tConnection error:", err.message);
        reject(err);
      });

      this.client.on("close", () => {
        this.isConnected = false;
        console.log("[client]\tConnection closed");
      });
    });
  }

  // Send data and wait for a response
  public async send(data: string): Promise<string> {
    await this.connect();

    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error("[client]\tSocket is not initialized"));
      }

      this.client.once("data", (response) => {
        resolve(response.toString());
      });

      this.client.once("error", (err) => {
        reject(err);
      });

      this.client.write(data, (err) => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  // Close the connection
  public close(): void {
    if (this.client) {
      this.client.end(() => {
        console.log("[client]\tConnection ended");
      });
    }
  }
}
