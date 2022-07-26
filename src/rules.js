module.exports = {
  rules: [
    {
      fun: "domParse",
    },
    {
      fun: "xpath",
      arg: `//*[@id="repo-content-pjax-container"]//div[@class='js-details-container Details']//div[@role='row']`,
    },
    {
      fun: "iterableFun",
      arg: {
        $$$$: [
          {
            fun: "toString",
          },
          {
            fun: "domParse",
          },
        ],
        title: [
          { fun: "xpath", arg: "//div[@role='rowheader']//a/text()" },
          {
            fun: "toString",
          },
        ],
        path: [
          { fun: "xpathSingle", arg: "//div[@role='rowheader']//a/@href" },
          {
            fun: "jsonPath",
            arg: "$.value",
          },
        ],
        time: [
          { fun: "xpathSingle", arg: "//*[@datetime]/@datetime" },
          {
            fun: "jsonPath",
            arg: "$.value",
          },
        ],
      },
    },
  ],
};
