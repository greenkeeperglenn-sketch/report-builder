"use client";

import { useState, useEffect } from "react";
import { DEFAULT_PROTOCOL_PROMPT, DEFAULT_REPORT_PROMPT } from "@/lib/prompts";

const STORAGE_KEY_PROTOCOL = "custom_protocol_prompt";
const STORAGE_KEY_REPORT = "custom_report_prompt";

export function useLocalPrompts() {
  const [protocolPrompt, setProtocolPrompt] = useState(DEFAULT_PROTOCOL_PROMPT);
  const [reportPrompt, setReportPrompt] = useState(DEFAULT_REPORT_PROMPT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedProtocol = localStorage.getItem(STORAGE_KEY_PROTOCOL);
    const savedReport = localStorage.getItem(STORAGE_KEY_REPORT);
    if (savedProtocol) setProtocolPrompt(savedProtocol);
    if (savedReport) setReportPrompt(savedReport);
    setLoaded(true);
  }, []);

  const saveProtocolPrompt = (prompt: string) => {
    setProtocolPrompt(prompt);
    localStorage.setItem(STORAGE_KEY_PROTOCOL, prompt);
  };

  const saveReportPrompt = (prompt: string) => {
    setReportPrompt(prompt);
    localStorage.setItem(STORAGE_KEY_REPORT, prompt);
  };

  const resetToDefaults = () => {
    setProtocolPrompt(DEFAULT_PROTOCOL_PROMPT);
    setReportPrompt(DEFAULT_REPORT_PROMPT);
    localStorage.removeItem(STORAGE_KEY_PROTOCOL);
    localStorage.removeItem(STORAGE_KEY_REPORT);
  };

  return {
    protocolPrompt,
    reportPrompt,
    saveProtocolPrompt,
    saveReportPrompt,
    resetToDefaults,
    loaded,
  };
}
