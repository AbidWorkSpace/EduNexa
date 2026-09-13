'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { _glaDomains, _glaMethods, _glaCostBenefit, _glaPlanTemplate } from 'src/_mock';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { GlaScoreCard } from './components/gla-score-card';
import { GlaDomainCard } from './components/gla-domain-card';
import { GlaMethodCard } from './components/gla-method-card';
import { GlaSectionCard } from './components/gla-section-card';
import { GlaReviewChecklist } from './components/gla-review-checklist';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'gla-poc-draft';

const planFields = [
  ['actions', 'Actions'],
  ['stakeholders', 'Stakeholders'],
  ['resources', 'Resources'],
  ['risks', 'Risks'],
  ['kpis', 'KPIs'],
  ['milestones', 'Milestones'],
];

const objectiveFields = [
  ['objective', 'Planning objective'],
  ['context', 'Region / context'],
  ['audience', 'Target audience'],
  ['timeline', 'Timeline'],
  ['constraints', 'Constraints'],
  ['expectedOutcome', 'Expected outcome'],
];

// ----------------------------------------------------------------------

export function GlaPocView() {
  const [tab, setTab] = useState('setup');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(_glaDomains[0].id);
  const [selectedMethodIds, setSelectedMethodIds] = useState(['stakeholder-mapping', 'resource-planning']);
  const [draft, setDraft] = useState({
    ..._glaPlanTemplate,
    objective: _glaDomains[0].sampleObjective,
    context: 'District-level implementation',
    audience: 'Public service teams and community stakeholders',
    expectedOutcome: 'A reviewed, measurable implementation plan ready for evaluator feedback.',
  });

  useEffect(() => {
    const storedDraft = window.localStorage.getItem(STORAGE_KEY);

    if (storedDraft) {
      try {
        const parsed = JSON.parse(storedDraft);
        setDraft((current) => ({ ...current, ...parsed.draft }));
        setSelectedDomainId(parsed.selectedDomainId || _glaDomains[0].id);
        setSelectedMethodIds(parsed.selectedMethodIds || []);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ draft, selectedDomainId, selectedMethodIds })
    );
  }, [draft, selectedDomainId, selectedMethodIds]);

  const selectedDomain = useMemo(
    () => _glaDomains.find((domain) => domain.id === selectedDomainId) ?? _glaDomains[0],
    [selectedDomainId]
  );

  const recommendedMethods = useMemo(
    () => _glaMethods.filter((method) => method.domainIds.includes(selectedDomainId)),
    [selectedDomainId]
  );

  const selectedMethods = useMemo(
    () => _glaMethods.filter((method) => selectedMethodIds.includes(method.id)),
    [selectedMethodIds]
  );

  const reviewItems = useMemo(
    () => [
      { label: 'Domain selected', done: Boolean(selectedDomainId) },
      { label: 'Objective and expected outcome completed', done: Boolean(draft.objective && draft.expectedOutcome) },
      { label: 'At least two planning methods selected', done: selectedMethodIds.length >= 2 },
      { label: 'Actions, risks, KPIs, and milestones drafted', done: Boolean(draft.actions && draft.risks && draft.kpis && draft.milestones) },
      { label: 'Cost-benefit scores ready for reviewer discussion', done: true },
    ],
    [draft, selectedDomainId, selectedMethodIds.length]
  );

  const completion = Math.round(
    (reviewItems.filter((item) => item.done).length / reviewItems.length) * 100
  );

  const handleSelectDomain = (domainId) => {
    const nextDomain = _glaDomains.find((domain) => domain.id === domainId);
    const nextMethods = _glaMethods
      .filter((method) => method.domainIds.includes(domainId))
      .slice(0, 2)
      .map((method) => method.id);

    setSelectedDomainId(domainId);
    setSelectedMethodIds(nextMethods);
    setDraft((current) => ({
      ...current,
      objective: nextDomain?.sampleObjective ?? current.objective,
      context: nextDomain?.name ?? current.context,
    }));
  };

  const handleChangeDraft = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleToggleMethod = (methodId) => {
    setSelectedMethodIds((current) =>
      current.includes(methodId) ? current.filter((id) => id !== methodId) : [...current, methodId]
    );
  };

  const handleSubmit = () => {
    setSubmitOpen(false);
    toast.success('Demo plan submitted for review');
  };

  const renderHeader = (
    <Stack spacing={3}>
      <CustomBreadcrumbs
        heading="GLA Planning POC"
        links={[
          { name: 'Dashboard', href: paths.dashboard.overview },
          { name: 'GLA POC' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={paths.dashboard.glaModules}
              variant="outlined"
              startIcon={<Iconify icon="solar:widget-5-outline" />}
            >
              Modules
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:check-read-outline" />}
              onClick={() => setSubmitOpen(true)}
            >
              Submit demo
            </Button>
          </Stack>
        }
      />

      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: 'background.neutral',
          border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4">Guided planning workspace</Typography>
                <Label color={completion === 100 ? 'success' : 'warning'}>{completion}% complete</Label>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 760 }}>
                Assemble a client-ready GLA plan using guided domain selection, method assembly,
                implementation sections, cost-benefit review, and validation checks.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<Iconify icon={selectedDomain.icon} />} label={selectedDomain.name} color={selectedDomain.color} />
              <Chip label={`${selectedMethods.length} methods`} variant="outlined" />
              <Chip label="Frontend POC" variant="outlined" />
            </Stack>
          </Stack>

          <LinearProgress
            value={completion}
            color={completion === 100 ? 'success' : 'primary'}
            variant="determinate"
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Stack>
      </Card>
    </Stack>
  );

  const renderSetup = (
    <Stack spacing={3}>
      <GlaSectionCard title="1. Select planning domain" icon="solar:target-outline">
        <Grid container spacing={2}>
          {_glaDomains.map((domain) => (
            <Grid key={domain.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <GlaDomainCard
                domain={domain}
                selected={domain.id === selectedDomainId}
                onSelect={handleSelectDomain}
              />
            </Grid>
          ))}
        </Grid>
      </GlaSectionCard>

      <GlaSectionCard title="2. Define objective" icon="solar:document-add-outline">
        <Grid container spacing={2}>
          {objectiveFields.map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, md: field === 'constraints' || field === 'expectedOutcome' ? 12 : 6 }}>
              <TextField
                fullWidth
                select={field === 'timeline'}
                multiline={field === 'constraints' || field === 'expectedOutcome'}
                minRows={field === 'constraints' || field === 'expectedOutcome' ? 3 : undefined}
                label={label}
                value={draft[field]}
                onChange={handleChangeDraft(field)}
              >
                {field === 'timeline' &&
                  ['30 days', '90 days', '6 months', '12 months'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          ))}
        </Grid>
      </GlaSectionCard>
    </Stack>
  );

  const renderWorkspace = (
    <Stack spacing={3}>
      <GlaSectionCard title="3. Assemble methods" icon="solar:layers-minimalistic-outline">
        <Grid container spacing={2}>
          {recommendedMethods.map((method) => (
            <Grid key={method.id} size={{ xs: 12, md: 6 }}>
              <GlaMethodCard
                method={method}
                selected={selectedMethodIds.includes(method.id)}
                onToggle={handleToggleMethod}
              />
            </Grid>
          ))}
        </Grid>
      </GlaSectionCard>

      <GlaSectionCard title="4. Build implementation plan" icon="solar:pen-new-square-outline">
        <Stack spacing={1.5}>
          {planFields.map(([field, label], index) => (
            <Accordion key={field} defaultExpanded={index < 2} variant="outlined">
              <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-outline" />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1">{label}</Typography>
                  <Label color={draft[field] ? 'success' : 'warning'}>
                    {draft[field] ? 'Drafted' : 'Missing'}
                  </Label>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={draft[field]}
                  onChange={handleChangeDraft(field)}
                  placeholder={`Add ${label.toLowerCase()} for ${selectedDomain.name}`}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </GlaSectionCard>
    </Stack>
  );

  const renderReview = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Stack spacing={3}>
          <GlaSectionCard title="5. Cost-benefit review" icon="solar:chart-2-outline">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GlaScoreCard title="Impact" value={_glaCostBenefit.impactScore} color="success" icon="solar:graph-up-bold" helper="Expected stakeholder and service value." />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GlaScoreCard title="Feasibility" value={_glaCostBenefit.feasibilityScore} color="info" icon="solar:check-circle-bold" helper="Sample readiness score for POC demo." />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GlaScoreCard title="Effort" value={_glaCostBenefit.effortScore} color="warning" icon="solar:clock-circle-bold" helper="Estimated implementation effort." />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GlaScoreCard title="Risk" value={_glaCostBenefit.riskScore} color="error" icon="solar:danger-triangle-bold" helper="Lower is better in this POC scale." />
              </Grid>
            </Grid>
          </GlaSectionCard>

          <GlaSectionCard title="6. Validation checklist" icon="solar:checklist-minimalistic-outline">
            <GlaReviewChecklist items={reviewItems} />
          </GlaSectionCard>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <GlaSectionCard
          title="Final plan preview"
          icon="solar:document-text-outline"
          action={<Label color="primary">Client demo</Label>}
        >
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Objective
              </Typography>
              <Typography variant="subtitle1">{draft.objective || 'No objective added yet.'}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Selected methods
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedMethods.map((method) => (
                  <Chip key={method.id} size="small" label={method.name} color="primary" variant="outlined" />
                ))}
              </Stack>
            </Stack>

            <Divider />

            {planFields.map(([field, label]) => (
              <Stack key={field} spacing={0.5}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Typography variant="body2">{draft[field]}</Typography>
              </Stack>
            ))}
          </Stack>
        </GlaSectionCard>
      </Grid>
    </Grid>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        {renderHeader}

        <CustomTabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
          <Tab value="setup" label="Setup" icon={<Iconify icon="solar:tuning-2-outline" />} iconPosition="start" />
          <Tab value="workspace" label="Workspace" icon={<Iconify icon="solar:widget-add-outline" />} iconPosition="start" />
          <Tab value="review" label="Review" icon={<Iconify icon="solar:check-read-outline" />} iconPosition="start" />
        </CustomTabs>

        <Box>
          {tab === 'setup' && renderSetup}
          {tab === 'workspace' && renderWorkspace}
          {tab === 'review' && renderReview}
        </Box>
      </Stack>

      <Dialog fullWidth maxWidth="sm" open={submitOpen} onClose={() => setSubmitOpen(false)}>
        <DialogTitle>Submit demo plan?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This POC action will mark the current plan as submitted for reviewer validation. No backend request
            is made yet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setSubmitOpen(false)}>
            Continue editing
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit for review
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
