"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "./auth.env" });
const signale_1 = require("signale");
const twitch_js_1 = __importDefault(require("twitch-js"));
const FS = __importStar(require("fs"));
const sleep = async (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
class TwitchMassBan {
    constructor() {
        this._self = this;
        this.Logger = new signale_1.Signale({
            interactive: false,
            secrets: [
                process.env.TWITCH_CLID,
                process.env.TWITCH_TOKEN,
                process.env.TWITCH_REFRESH,
            ],
        });
        this.Counters = {
            total: {
                count: 0,
                log: new signale_1.Signale({ interactive: true, scope: "Total" }),
            },
            channel: {
                count: 0,
                log: new signale_1.Signale({ interactive: true, scope: "Channels" }),
            },
        };
        this.options = {
            clientId: process.env.TWITCH_CLID,
            token: process.env.TWITCH_TOKEN,
            username: process.env.TWITCH_USERNAME,
            log: { destination: "./twitchjs.log" },
        };
        this.Twitch = new twitch_js_1.default({
            token: this.options.token,
            username: this.options.username,
            clientId: this.options.clientId,
            log: this.options.log,
        });
        this.flags = {
            channel: "",
            list: "",
        };
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
            this.Logger.error("Missing required flags. -c channel -l listOfUsernames");
        });
    }
    resetCounters() {
        this.Counters.total.count = 0;
        this.Counters.channel.count = 0;
    }
    getOptions() {
        return this.options;
    }
    async readFlags() {
        process.argv.forEach((value, index, array) => {
            switch (value) {
                case "-c":
                    this.flags.channel = array[index + 1];
                case "-l":
                    this.flags.list = array[index + 1];
            }
        }, this._self);
    }
    getFlags() {
        return this.flags;
    }
    getChannelFlag() {
        return this.flags.channel;
    }
    getListFlag() {
        return this.flags.list;
    }
    parseListFlag() {
        return FS.readFileSync(this.getListFlag(), "utf8").split("\n");
    }
    parseChannelFlag() {
        let a = this.getChannelFlag().split(",");
        if (a[a.length - 1] == "")
            delete a[a.length - 1];
        return a;
    }
    process(undo = false) {
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
                this.Counters.total.log.pending(`${prefix} ${this.Counters.total.count}`);
            }, this._self);
            this.Counters.channel.count++;
            this.Counters.channel.log.pending(`${prefix} ${this.Counters.channel.count}`);
        }, this._self);
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
