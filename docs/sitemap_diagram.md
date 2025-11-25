graph TD
    Root[DeHive Platform]

    Root --> Public[Public Pages]
    Root --> Auth[Authentication]
    Root --> MainApp[Main Application]

    Public --> Landing["/"]

    Auth --> SSO["/sso"]
    Auth --> Invite["/invite"]

    MainApp --> App["/app"]

    App --> DM[Direct Messages]
    App --> Servers[Servers]
    App --> User[User Features]

    DM --> DMList["/app/channels/me"]
    DM --> DMChat["/app/channels/me/[channelId]"]
    DM --> DMCallPage["/app/channels/me/[channelId]/call"]
    DM --> DMPayment["/app/channels/me/[channelId]/[wallet]"]

    Servers --> ServerList["/app/channels/[serverId]"]
    Servers --> ChannelView["/app/channels/[serverId]/[channelId]"]
    Servers --> ChannelCallPage["/app/channels/[serverId]/[channelId]/call"]

    ServerList --> Management[Server Management]
    Management --> Categories[Categories]
    Management --> Channels[Channels]
    Management --> Members[Members]
    Management --> NFT[NFT Gating]
    Management --> Logs[Server Logs]

    User --> Profile[Profile Settings]
    User --> Status[Status Management]
    User --> Airdrop[Airdrop Campaigns]

    classDef level1 fill:#4F46E5,stroke:#312E81,color:#fff
    classDef level2 fill:#7C3AED,stroke:#5B21B6,color:#fff
    classDef level3 fill:#059669,stroke:#047857,color:#fff
    classDef level4 fill:#0891B2,stroke:#0E7490,color:#fff

    class Root level1
    class Public,Auth,MainApp level2
    class App,DM,Servers,User level3
    class DMList,DMChat,DMCallPage,DMPayment,ServerList,ChannelView,ChannelCallPage,Management,Profile,Status,Airdrop level4
