{{- define "gonenote.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "gonenote.labels" -}}
app.kubernetes.io/name: {{ include "gonenote.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "gonenote.redis.fullname" -}}
{{ include "gonenote.fullname" . }}-redis
{{- end }}
