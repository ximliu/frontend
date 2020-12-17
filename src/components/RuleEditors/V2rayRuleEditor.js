import React, { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";

import { ArrowClockwise, Plus, Minus } from "phosphor-react";
import { Input, Label, Select, Button, Textarea } from "@windmill/react-ui";

// import { PlusIcon, MinusIcon } from "../../icons";
import { createForwardRule, editForwardRule } from "../../redux/actions/ports";
import VmessInboundEditor from "./V2ray/VmessInboundEditor";
import ShadowsocksInboundEditor from "./V2ray/ShadowsocksInboundEditor";
import DokodemoDoorInboundEditor from "./V2ray/DokodemoDoorInboundEditor";
import FreedomEditor from "./V2ray/FreedomEditor";
import BlackholeEditor from "./V2ray/BlockholeEditor";

import { isJSON } from "../../utils/json";

const V2rayTemplates = [
  { label: "不使用模版", value: 0 },
  { label: "relay+tls", value: 1 },
  { label: "relay+ws", value: 2 },
  { label: "relay+wss", value: 3 },
  { label: "ss隧道", value: 4 },
  { label: "端口转发", value: 5 },
];

const InboundProtocols = [
  { label: "vmess", value: "vmess" },
  { label: "shadowsocks", value: "shadowsocks" },
  { label: "自定义", value: "custom" },
  // { label: "dokodemo-door", value: "dokodemo-door" },
  // { label: "http", value: "http" },
  // { label: "socks", value: "socks" },
];
const OutboundProtocols = [
  { label: "freedom", value: "freedom" },
  { label: "blackhole", value: "blackhole" },
  { label: "自定义", value: "custom" },
  // { label: "vmess", value: "vmess" },
  // { label: "shadowsocks", value: "shadowsocks" },
  // { label: "http", value: "http" },
  // { label: "socks", value: "socks" },
];

const V2rayRuleEditor = ({
  serverId,
  port,
  method,
  forwardRule,
  setValidRuleForm,
  setSubmitRuleForm,
}) => {
  const dispatch = useDispatch();
  const [template, setTemplate] = useState(0);
  const [inboundProtocol, setInboundProtocol] = useState("vmess");
  const [inboundSettings, setInboundSettings] = useState({});
  const [inboundStreamSettings, setInboundStreamSettings] = useState({});
  const [inboundSniffing, setInboundSniffing] = useState({ enabled: false });
  const [customInbound, setCustomInbound] = useState("");
  const [validInbound, setValidInbound] = useState(() => () => false);
  const [outboundProtocol, setOutboundProtocol] = useState("freedom");
  const [outboundSettings, setOutboundSettings] = useState({});
  const [outboundStreamSettings, setOutboundStreamSettings] = useState({});
  const [customOutbound, setCustomOutbound] = useState("");
  const [validOutbound, setValidOutbound] = useState(() => () => false);
  const [tab, setTab] = useState({ inbound: true });

  const validRuleForm = useCallback(
    () =>
      (inboundProtocol === "custom" ? isJSON(customInbound) : validInbound()) &&
      (outboundProtocol === "custom"
        ? isJSON(customOutbound)
        : validOutbound()),
    [validInbound, validOutbound, customInbound, customOutbound]
  );
  const submitRuleForm = useCallback(() => {
    const data = {
      method,
      config: {},
    };
    if (inboundProtocol === "custom") {
      data.config.inbound = JSON.parse(customInbound);
      data.config.custom_inbound = true;
    } else {
      data.config.inbound = {
        protocol: inboundProtocol,
        settings: inboundSettings,
        streamSettings: inboundStreamSettings,
        sniffing: inboundSniffing,
      };
      data.config.custom_inbound = false;
    }
    if (outboundProtocol === "custom") {
      data.config.outbound = JSON.parse(customOutbound);
      data.config.custom_outbound = true;
    } else {
      data.config.outbound = {
        protocol: outboundProtocol,
        settings: outboundSettings,
        streamSettings: outboundStreamSettings,
      };
      data.config.custom_outbound = false;
    }
    if (forwardRule) {
      dispatch(editForwardRule(serverId, port.id, data));
    } else {
      dispatch(createForwardRule(serverId, port.id, data));
    }
  }, [
    dispatch,
    serverId,
    port,
    forwardRule,
    method,
    customInbound,
    customOutbound,
    inboundProtocol,
    inboundSettings,
    inboundStreamSettings,
    inboundSniffing,
    outboundProtocol,
    outboundSettings,
    outboundStreamSettings,
  ]);
  const handleTemplate = (t) => {
    setTemplate(t);
    switch (t) {
      case "1":
        break;
      case "2":
        break;
      case "3":
        break;
      case "4":
        break;
      case "5":
        break;
      default:
    }
  };

  useEffect(() => {
    if (method === "v2ray") {
      setValidRuleForm(() => validRuleForm);
      setSubmitRuleForm(() => submitRuleForm);
    }
  }, [
    method,
    setValidRuleForm,
    setSubmitRuleForm,
    validRuleForm,
    submitRuleForm,
  ]);

  useEffect(() => {
    if (
      forwardRule &&
      forwardRule.config &&
      forwardRule.config.custom_inbound
    ) {
      setInboundProtocol("custom");
      setCustomInbound(
        JSON.stringify(forwardRule.config.inbound, undefined, 2)
      );
    } else if (
      forwardRule &&
      forwardRule.config &&
      forwardRule.config.inbound &&
      forwardRule.config.inbound.protocol &&
      InboundProtocols.find(
        (p) => p.value === forwardRule.config.inbound.protocol
      ) !== undefined
    ) {
      setInboundProtocol(forwardRule.config.inbound.protocol);
    } else setInboundProtocol("vmess");

    if (
      forwardRule &&
      forwardRule.config &&
      forwardRule.config.custom_outbound
    ) {
      setOutboundProtocol("custom");
      setCustomOutbound(JSON.stringify(forwardRule.config.outbound));
    } else if (
      forwardRule &&
      forwardRule.config &&
      forwardRule.config.outbounds &&
      forwardRule.config.outbound.protocol &&
      OutboundProtocols.find(
        (p) => p.value === forwardRule.config.outbound.protocol
      ) !== undefined
    ) {
      setOutboundProtocol(forwardRule.config.outbound.protocol);
    } else setOutboundProtocol("freedom");
  }, [
    forwardRule,
    setInboundProtocol,
    setOutboundProtocol,
    setCustomInbound,
    setCustomOutbound,
  ]);

  return (
    <>
      <Label className="mt-1">
        <div className="flex flex-row justify-between items-center mt-1">
          <div className="w-1/3">
            <span>配置模版</span>
          </div>
          <div className="w-2/3">
            <Select
              value={template}
              onChange={(e) => handleTemplate(e.target.value)}
            >
              {V2rayTemplates.map((option) => (
                <option
                  value={option.value}
                  key={`gost_template_${option.value}`}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Label>
      <Label className="mt-4">
        <div className="flex flex-row justify-start items-center space-x-2">
          <Button className="hidden" />
          <div
            className={`${tab.inbound ? "border-b-2" : ""} ${
              !validInbound() ? "border-red-500 border-b-2 text-red-500" : ""
            }`}
          >
            <Button
              layout="link"
              onClick={(e) => {
                e.preventDefault();
                setTab({ inbound: true });
              }}
            >
              Inbound
            </Button>
          </div>
          <div
            className={`${tab.outbound ? "border-b-2" : ""} ${
              !validOutbound() ? "border-red-600 border-b-2" : ""
            }`}
          >
            <Button
              layout="link"
              onClick={(e) => {
                e.preventDefault();
                setTab({ outbound: true });
              }}
            >
              Outbound
            </Button>
          </div>
        </div>
      </Label>
      <div className={`${tab.inbound ? "block" : "hidden"}`}>
        <Label className="mt-4">
          <div className="flex flex-row justify-between items-center mt-1">
            <div className="w-1/3">
              <span>协议</span>
            </div>
            <div className="w-2/3">
              <Select
                value={inboundProtocol}
                onChange={(e) => setInboundProtocol(e.target.value)}
              >
                {InboundProtocols.map((option) => (
                  <option
                    value={option.value}
                    key={`inbound_protocol_${option.value}`}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Label>
        <Label className="mt-1">
          {inboundProtocol === "vmess" ? (
            <VmessInboundEditor
              forwardRule={forwardRule}
              protocol={inboundProtocol}
              settings={inboundSettings}
              setSettings={setInboundSettings}
              streamSettings={inboundStreamSettings}
              setStreamSettings={setInboundStreamSettings}
              sniffing={inboundSniffing}
              setSniffing={setInboundSniffing}
              setValid={setValidInbound}
            />
          ) : null}
          {inboundProtocol === "shadowsocks" ? (
            <ShadowsocksInboundEditor
              forwardRule={forwardRule}
              protocol={inboundProtocol}
              settings={inboundSettings}
              setSettings={setInboundSettings}
              setValid={setValidInbound}
            />
          ) : null}
          {inboundProtocol === "dokodemo-door" ? (
            <DokodemoDoorInboundEditor
              forwardRule={forwardRule}
              protocol={inboundProtocol}
              settings={inboundSettings}
              setSettings={setInboundSettings}
              setValid={setValidInbound}
            />
          ) : null}
          {inboundProtocol === "custom" ? (
            <Textarea
              className="mt-4"
              rows="6"
              value={customInbound}
              onChange={(e) => setCustomInbound(e.target.value)}
            />
          ) : null}
        </Label>
      </div>
      <div className={`${tab.outbound ? "block" : "hidden"}`}>
        <Label className="mt-4">
          <div className="flex flex-row justify-between items-center mt-1">
            <span className="w-1/2">协议</span>
            <Select
              className="w-1/2"
              value={outboundProtocol}
              onChange={(e) => setOutboundProtocol(e.target.value)}
            >
              {OutboundProtocols.map((option) => (
                <option
                  value={option.value}
                  key={`outbound_protocol_${option.value}`}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </Label>
        <Label className="mt-1">
          {/* {outboundProtocol === "vmess" ? (
            <VmessEditor
              protocol={outboundProtocol}
              settings={inboundSettings}
              setSettings={setInboundSettings}
              setValid={setValidOutbound}
            />
          ) : null} */}
          {outboundProtocol === "freedom" ? (
            <FreedomEditor
              protocol={outboundProtocol}
              setValid={setValidOutbound}
            />
          ) : null}
          {outboundProtocol === "blackhole" ? (
            <BlackholeEditor
              protocol={outboundProtocol}
              setValid={setValidOutbound}
            />
          ) : null}
          {outboundProtocol === "custom" ? (
            <Textarea
              className="mt-4"
              rows="6"
              value={customOutbound}
              onChange={(e) => setCustomOutbound(e.target.value)}
            />
          ) : null}
        </Label>
      </div>
    </>
  );
};

export default V2rayRuleEditor;
