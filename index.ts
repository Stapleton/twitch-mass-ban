require("dotenv").config({ path: "./auth.env" });

import { Signale } from "signale";
import TwitchJS, { TwitchJsOptions } from "twitch-js";
import * as FS from "fs";

type Flags = { channel: string; list: string };

class TwitchMassBan {
  private _self = this;
  private Logger: Signale = new Signale({ interactive: true });

  private Twitch: TwitchJS = new TwitchJS(this.getOptions());

  private options: TwitchJsOptions = {
    token: process.env.TWITCH_OAUTH,
    username: process.env.TWITCH_USERNAME,
  };

  private flags: Flags = {
    channel: "",
    list: "",
  };

  public getOptions(): Object {
    return this.options;
  }

  public async readFlags(): Promise<void> {
    process.argv.forEach((value, index, array) => {
      switch (value) {
        case "-c":
          this.flags.channel = array[index + 1];
        case "-l":
          this.flags.list = array[index + 1];
        default:
          this.Logger.error(
            "Missing required flags. -c channel -l listOfUsernames"
          );
      }
    }, this._self);
  }

  public getFlags(): Flags {
    return this.flags;
  }

  public getChannelFlag(): string {
    return this.flags.channel;
  }

  public getListFlag(): string {
    return this.flags.list;
  }

  public parseListFlag(): string[] {
    return FS.readFileSync(this.getListFlag(), "utf8").split("\n");
  }

  public parseChannelFlag(): string[] {
    return this.getChannelFlag().split(",");
  }

  private process() {
    let list = this.parseListFlag();
    let channels = this.parseChannelFlag();

    channels.forEach((channel) => {
      list.forEach((user) => {
        this.Twitch.chat.ban(channel, user);
      }, this._self);
    }, this._self);
  }

  constructor() {
    this.readFlags().then(() => {
      this.Logger.success("Read command line flags!");
      this.Logger.pending("Connecting to Twitch Chat...");
      this.Twitch.chat.connect();
      this.Logger.success("Connected to Twitch!");
      this.Logger.await("Processing...");
      this.Logger.time("ban");
      this.process();
      this.Logger.complete(`Done. Took ${this.Logger.timeEnd("ban")}`);
    });
  }
}

/* Compilation Errors
node_modules/twitch-js/types/index.d.ts:1541:26 - error TS2304: Cannot find name 'RequestInit'.

1541 type FetchOptions = Omit<RequestInit, "headers"> & SearchOption & HeaderOption;
                              ~~~~~~~~~~~

node_modules/twitch-js/types/index.d.ts:1634:84 - error TS2304: Cannot find name 'Response'.

1634     initialize(newOptions?: Partial<ApiOptions>): Promise<void | ApiRootResponse | Response>;
                                                                                        ~~~~~~~~

node_modules/twitch-js/types/index.d.ts:1660:73 - error TS2304: Cannot find name 'Response'.

1660     get<T = any>(endpoint?: string, options?: ApiFetchOptions): Promise<Response | T>;
                                                                             ~~~~~~~~

node_modules/twitch-js/types/index.d.ts:1664:73 - error TS2304: Cannot find name 'Response'.

1664     post<T = any>(endpoint: string, options?: ApiFetchOptions): Promise<Response | T>;
                                                                             ~~~~~~~~

node_modules/twitch-js/types/index.d.ts:1668:72 - error TS2304: Cannot find name 'Response'.

1668     put<T = any>(endpoint: string, options?: ApiFetchOptions): Promise<Response | T>;
                                                                            ~~~~~~~~


Found 5 errors.
*/
