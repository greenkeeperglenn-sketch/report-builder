"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_PROTOCOL_PROMPT, DEFAULT_REPORT_PROMPT } from "@/lib/prompts";
import { PromptVersion } from "@/lib/types";

const STORAGE_KEY_PROTOCOL = "custom_protocol_prompt";
const STORAGE_KEY_REPORT = "custom_report_prompt";
const STORAGE_KEY_VERSIONS = "prompt_versions";

function generateVersionName(versions: PromptVersion[]): string {
  if (versions.length === 0) return "V1.0";
  const last = versions[versions.length - 1].name;
  const match = last.match(/^V(\d+)\.(\d+)$/);
  if (!match) return `V1.${versions.length}`;
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  return `V${major}.${minor + 1}`;
}

export function useLocalPrompts() {
  const [protocolPrompt, setProtocolPrompt] = useState(DEFAULT_PROTOCOL_PROMPT);
  const [reportPrompt, setReportPrompt] = useState(DEFAULT_REPORT_PROMPT);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedProtocol = localStorage.getItem(STORAGE_KEY_PROTOCOL);
    const savedReport = localStorage.getItem(STORAGE_KEY_REPORT);
    const savedVersions = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (savedProtocol) setProtocolPrompt(savedProtocol);
    if (savedReport) setReportPrompt(savedReport);
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions));
      } catch {
        // ignore corrupt data
      }
    }
    setLoaded(true);
  }, []);

  const saveProtocolPrompt = useCallback((prompt: string) => {
    setProtocolPrompt(prompt);
    localStorage.setItem(STORAGE_KEY_PROTOCOL, prompt);
  }, []);

  const saveReportPrompt = useCallback((prompt: string) => {
    setReportPrompt(prompt);
    localStorage.setItem(STORAGE_KEY_REPORT, prompt);
  }, []);

  const saveVersion = useCallback((customName?: string) => {
    setVersions((prev) => {
      const name = customName || generateVersionName(prev);
      const newVersion: PromptVersion = {
        id: crypto.randomUUID(),
        name,
        date: new Date().toISOString(),
        protocolPrompt,
        reportPrompt,
      };
      const updated = [...prev, newVersion];
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(updated));
      return updated;
    });
  }, [protocolPrompt, reportPrompt]);

  const restoreVersion = useCallback((id: string) => {
    const version = versions.find((v) => v.id === id);
    if (!version) return;
    setProtocolPrompt(version.protocolPrompt);
    setReportPrompt(version.reportPrompt);
    localStorage.setItem(STORAGE_KEY_PROTOCOL, version.protocolPrompt);
    localStorage.setItem(STORAGE_KEY_REPORT, version.reportPrompt);
  }, [versions]);

  const deleteVersion = useCallback((id: string) => {
    setVersions((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setProtocolPrompt(DEFAULT_PROTOCOL_PROMPT);
    setReportPrompt(DEFAULT_REPORT_PROMPT);
    localStorage.removeItem(STORAGE_KEY_PROTOCOL);
    localStorage.removeItem(STORAGE_KEY_REPORT);
  }, []);

  return {
    protocolPrompt,
    reportPrompt,
    saveProtocolPrompt,
    saveReportPrompt,
    resetToDefaults,
    loaded,
    versions,
    saveVersion,
    restoreVersion,
    deleteVersion,
  };
}
