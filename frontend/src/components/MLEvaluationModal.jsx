import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, BrainCircuit, CheckCircle2, BarChart2, Cpu, RefreshCw, Award } from 'lucide-react';

export default function MLEvaluationModal({ onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ml/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Error fetching ML metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainMsg('Retraining scikit-learn models on updated historical academic records...');
      const res = await axios.post('/api/ml/retrain');
      setRetrainMsg('Model retrained successfully!');
      fetchMetrics();
    } catch (err) {
      setRetrainMsg('Retraining failed or Python service offline.');
    } finally {
      setRetraining(false);
    }
  };

  if (!metrics && loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl flex items-center space-x-3 text-navy-900 font-semibold">
          <RefreshCw className="w-6 h-6 animate-spin text-gold-500" />
          <span>Loading ML Microservice Evaluation Metrics...</span>
        </div>
      </div>
    );
  }

  const evalData = metrics?.evaluation_metrics || {};
  const bestModel = metrics?.best_model || 'Logistic Regression';
  const featImp = metrics?.feature_importance || {};

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="bg-navy-900 px-6 py-4 flex items-center justify-between text-white border-b-2 border-gold-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display">ML Model Evaluation & Reliability Report</h3>
              <p className="text-xs text-slate-300">Transparent AI metrics for Early Pass/Fail Warning System</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border border-gold-500/30">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-gold-400" />
                <span className="text-xs font-semibold uppercase text-gold-400 tracking-wider">Active Deployed Model</span>
              </div>
              <h4 className="text-xl font-bold font-display text-white mt-1">{bestModel}</h4>
              <p className="text-xs text-slate-300 mt-0.5">Trained on {metrics?.dataset_summary?.total_records || 300} historical student performance records.</p>
            </div>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining...' : 'Retrain Model'}</span>
            </button>
          </div>

          {retrainMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-medium">
              {retrainMsg}
            </div>
          )}

          {/* Model Comparison Table */}
          <div>
            <h4 className="font-bold text-navy-900 mb-3 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-gold-600" />
              <span>Algorithm Performance Comparison</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Precision</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3">F1-Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {Object.entries(evalData).map(([name, data]) => {
                    const isSelected = name === bestModel;
                    return (
                      <tr key={name} className={isSelected ? 'bg-amber-500/10 font-medium' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-semibold text-navy-900">{name}</td>
                        <td className="p-3">{(data.accuracy * 100).toFixed(1)}%</td>
                        <td className="p-3">{(data.precision * 100).toFixed(1)}%</td>
                        <td className="p-3">{(data.recall * 100).toFixed(1)}%</td>
                        <td className="p-3 font-bold text-navy-900">{data.f1_score.toFixed(4)}</td>
                        <td className="p-3">
                          {isSelected ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importances */}
          <div>
            <h4 className="font-bold text-navy-900 mb-3 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-gold-600" />
              <span>Key Prediction Feature Weights</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(featImp).map(([feature, weight]) => (
                <div key={feature} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 capitalize">{feature.replace('_', ' ')}</div>
                  <div className="text-base font-bold text-navy-900 mt-1">{weight}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
