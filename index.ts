require("dotenv").config({ path: "./auth.env" });

import { Signale } from "signale";
import TwitchJS, { TwitchJsOptions } from "twitch-js";
import * as FS from "fs";

type Flags = { channel: string; list: string };
type Counter = {
  count: number;
  log: Signale;
};
type Counters = {
  total: Counter;
  channel: Counter;
};

const sleep = async (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

class TwitchMassBan {
  private _self = this;

  private Logger: Signale = new Signale({
    interactive: false,
    secrets: [
      process.env.TWITCH_CLID,
      process.env.TWITCH_TOKEN,
      process.env.TWITCH_REFRESH,
    ],
  });

  private Counters: Counters = {
    total: {
      count: 0,
      log: new Signale({ interactive: true, scope: "Total" }),
    },
    channel: {
      count: 0,
      log: new Signale({ interactive: true, scope: "Channels" }),
    },
  };

  private resetCounters(): void {
    this.Counters.total.count = 0;
    this.Counters.channel.count = 0;
  }

  private options: TwitchJsOptions = {
    clientId: process.env.TWITCH_CLID,
    token: process.env.TWITCH_TOKEN,
    username: process.env.TWITCH_USERNAME,
    log: { destination: "./twitchjs.log" },
  };

  public getOptions(): TwitchJsOptions {
    return this.options;
  }

  private Twitch: TwitchJS = new TwitchJS({
    token: this.options.token,
    username: this.options.username,
    clientId: this.options.clientId,
    log: this.options.log,
  });

  private flags: Flags = {
    channel: "",
    list: "",
  };

  public async readFlags(): Promise<void> {
    process.argv.forEach((value, index, array) => {
      switch (value) {
        case "-c":
          this.flags.channel = array[index + 1];
        case "-l":
          this.flags.list = array[index + 1];
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
    let a = this.getChannelFlag().split(",");
    if (a[a.length - 1] == "") delete a[a.length - 1];
    return a;
  }

  private process(undo: boolean = false) {
    let list = this.parseListFlag();
    let channels = this.parseChannelFlag();
    let prefix = undo ? "Unbanning..." : "Banning...";

    channels.forEach((channel) => {
      list.forEach((user) => {
        sleep("300").then(() => {
          undo
            ? this.Twitch.chat.unban(channel, user)
            : this.Twitch.chat.ban(channel, user);
        });

        this.Counters.total.count++;
        this.Counters.total.log.pending(
          `${prefix} ${this.Counters.total.count}`
        );
      }, this._self);

      this.Counters.channel.count++;
      this.Counters.channel.log.pending(
        `${prefix} ${this.Counters.channel.count}`
      );
    }, this._self);
  }

  constructor() {
    this.readFlags()
      .then(() => {
        this.Logger.success("Read command line flags!");

        this.Logger.pending("Connecting to Twitch Chat...");

        this.Twitch.chat.connect().then(() => {
          this.Logger.success("Connected to Twitch!");

          this.Logger.disable();
          this.Logger.time("timer");
          this.Logger.enable();

          this.process();

          this.Logger.disable();
          let timer = this.Logger.timeEnd("timer");
          this.Logger.enable();

          this.Logger.complete(`Done. Took ${timer.span}ms`);

          this.resetCounters();
          this.process(true);
          process.exit();
        });
      })
      .catch((e) => {
        this.Logger.error(
          "Missing required flags. -c channel -l listOfUsernames"
        );
      });
  }
}

new TwitchMassBan();

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
