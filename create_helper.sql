-- Crear función helper para ejecutar SQL
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS TABLE(result TEXT) AS $$
BEGIN
  EXECUTE sql_text;
  RETURN QUERY SELECT 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;
