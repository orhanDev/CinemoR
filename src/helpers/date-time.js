import moment from "moment";
import "moment/locale/de";

const parseDate = (date) => {
  if (!date) return null;
  const m = moment(date, ["DD.MM.YY", "DD.MM.YYYY", "YYYY-MM-DD"]);
  return m.isValid() ? m : moment(date);
};

export const formatDatell = (date) => {
  const m = parseDate(date);
  return m?.isValid() ? m.locale("de").format("ll") : "";
};

export const formatDateMY = (date) => {
  const m = parseDate(date);
  return m?.isValid() ? m.locale("de").format("MMM YYYY") : "";
};

export const formatTimeLT = (time) => {
  return moment(time, "HH:mm:ss").format("LT");
};

export const isLater = (timeBefore, timeAfter) => {
  const tb = moment(timeBefore, "HH:mm");
  const ta = moment(timeAfter, "HH:mm");
  return ta.isAfter(tb);
};

export const isTimeValid = (time) => {
  const regex = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
  return regex.test(time);
};

export const convertTimeToDateTime = (time) => {
  const dateTimeStr = `2000-01-01 ${time}`;
  return new Date(dateTimeStr);
};
