import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKnowledgeGraph, getPatientDataEntries, getPatientData } from '../services/api';

const KnowledgeGraphViewer = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [patient, setPatient] = useState(null);
  const [dataEntries, setDataEntries] = useState([]);
  const [modelSummary, setModelSummary] = useState('');
  const [modelRisk, setModelRisk] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [graph, patientData, entries] = await Promise.all([
          getKnowledgeGraph(parseInt(patientId)),
          getPatientData(parseInt(patientId)),
          getPatientDataEntries(parseInt(patientId))
        ]);
        
        setKnowledgeGraph(graph);
        setPatient(patientData);
        setDataEntries(entries);
        if (graph?.metadata) {
          setModelSummary(graph.metadata.summary || '');
          setModelRisk(graph.metadata.riskScores || null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-medical-blue-600 text-lg">Loading knowledge graph...</div>
      </div>
    );
  }

  if (!knowledgeGraph) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          No knowledge graph found for this patient. Please generate one first.
        </div>
        <button
          onClick={() => navigate(`/doctor/data-entry/${patientId}`)}
          className="px-6 py-2 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 transition-colors"
        >
          Go to Data Entry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Knowledge Graph</h2>
            {patient && (
              <p className="text-medical-blue-100">
                Patient: {patient.name} | Generated: {new Date(knowledgeGraph.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Knowledge Graph Visualization */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Visualization</h3>
        
        {/* Placeholder for actual graph visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🕸️</div>
            <p className="text-gray-600 font-medium">Knowledge Graph Visualization</p>
            <p className="text-sm text-gray-500 mt-2">
              Model integration returns graph structure; visualization placeholder remains.
            </p>
            {knowledgeGraph.nodes && (
              <p className="text-xs text-gray-400 mt-2">
                Nodes: {knowledgeGraph.nodes.length} | Edges: {knowledgeGraph.edges?.length || 0}
              </p>
            )}
          </div>
        </div>

        {/* Graph Data Info */}
        {knowledgeGraph.nodes && knowledgeGraph.nodes.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Graph Structure</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-1">Nodes ({knowledgeGraph.nodes.length}):</p>
                <ul className="text-blue-700 space-y-1">
                  {knowledgeGraph.nodes.slice(0, 5).map((node, idx) => (
                    <li key={idx}>• {node.label || node.id} ({node.type})</li>
                  ))}
                  {knowledgeGraph.nodes.length > 5 && (
                    <li className="text-blue-600">... and {knowledgeGraph.nodes.length - 5} more</li>
                  )}
                </ul>
              </div>
              {knowledgeGraph.edges && knowledgeGraph.edges.length > 0 && (
                <div>
                  <p className="font-medium text-blue-800 mb-1">Edges ({knowledgeGraph.edges.length}):</p>
                  <ul className="text-blue-700 space-y-1">
                    {knowledgeGraph.edges.slice(0, 5).map((edge, idx) => (
                      <li key={idx}>• {edge.from} → {edge.to} ({edge.label})</li>
                    ))}
                    {knowledgeGraph.edges.length > 5 && (
                      <li className="text-blue-600">... and {knowledgeGraph.edges.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {(modelSummary || modelRisk) && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Model Insights</h4>
            {modelSummary && <p className="text-sm text-green-800 mb-2">{modelSummary}</p>}
            {modelRisk && (
              <div className="text-sm text-green-800">
                <p className="font-medium text-green-900 mb-1">Risk Scores</p>
                <pre className="bg-white rounded-md p-2 text-xs text-green-900 overflow-auto">
{JSON.stringify(modelRisk, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Sources */}
      {dataEntries.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
          <div className="space-y-3">
            {dataEntries.map((entry, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Entry #{idx + 1} - {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {entry.clinicalNotes && (
                    <div>
                      <p className="font-medium text-gray-700">Clinical Notes:</p>
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                        {entry.clinicalNotes.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                  {entry.patientData && (
                    <div>
                      <p className="font-medium text-gray-700">Patient Data:</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {entry.patientDataFileName || 'Text data'} ({entry.patientData.length} chars)
                      </p>
                    </div>
                  )}
                  {entry.imagingData && entry.imagingData.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Imaging Data:</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {entry.imagingData.length} file(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphViewer;

