import { Report, Prefabs } from "@latticexyz/stressoor";

const {
  ReportTime,
  ReportTimeTemplatedString,
  ReportMaxMinMean,
  ReportStats,
  ReportDataArray,
} = Prefabs.Report;

// TODO: add gas reporting

export const reports: Report[] = [
  new ReportTime(),
  new ReportStats("txLatency", "milliseconds"),
  new ReportStats("txBlockNumberDelta", "blockNumberDelta"),
  new ReportMaxMinMean("txReceiptBlockNumber", "receiptBlockNumber"),
  new ReportMaxMinMean("txStatus", "status"),
  new ReportMaxMinMean("txL2Success", "l2Success"),
  new ReportTimeTemplatedString(
    "grafanaUrl",
    "<grafanaUrl>&from=$startTime&to=$endTime"
  ),
];
