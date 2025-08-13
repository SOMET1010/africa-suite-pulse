{{/*
Expand the name of the chart.
*/}}
{{- define "africasuite.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "africasuite.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "africasuite.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "africasuite.labels" -}}
helm.sh/chart: {{ include "africasuite.chart" . }}
{{ include "africasuite.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "africasuite.selectorLabels" -}}
app.kubernetes.io/name: {{ include "africasuite.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "africasuite.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "africasuite.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL fullname
*/}}
{{- define "africasuite.postgresql.fullname" -}}
{{- printf "%s-postgresql" (include "africasuite.fullname" .) }}
{{- end }}

{{/*
PostgreSQL secret name
*/}}
{{- define "africasuite.postgresql.secretName" -}}
{{- printf "%s-postgresql" (include "africasuite.fullname" .) }}
{{- end }}

{{/*
Redis fullname
*/}}
{{- define "africasuite.redis.fullname" -}}
{{- printf "%s-redis" (include "africasuite.fullname" .) }}
{{- end }}

{{/*
MinIO fullname
*/}}
{{- define "africasuite.minio.fullname" -}}
{{- printf "%s-minio" (include "africasuite.fullname" .) }}
{{- end }}

{{/*
MinIO secret name
*/}}
{{- define "africasuite.minio.secretName" -}}
{{- printf "%s-minio" (include "africasuite.fullname" .) }}
{{- end }}